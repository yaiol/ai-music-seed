//! A small server on this machine only, the twin of the Electron app's Express API for what the page-side audio needs:
//! `GET /packs`, `GET /pack/:name/:file` (the compiled sample packs) and `POST /save-seed` (the rendered audio and MIDI
//! written beside the `.yams`).
//!
//! Every address carries a token made at start, so another program on the machine cannot read or write through it by
//! guessing the port.

use crate::files;
use base64::{Engine, engine::general_purpose::STANDARD};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{
    fs,
    hash::{BuildHasher, Hasher},
    io::{self, Read, Write},
    net::{TcpListener, TcpStream},
    path::{Path, PathBuf},
    thread,
    time::Duration,
};

pub struct Server {
    pub port: u16,
    pub token: String,
}

fn random_token() -> String {
    let part = || std::collections::hash_map::RandomState::new().build_hasher().finish();
    format!("{:016x}{:016x}", part(), part())
}

impl Server {
    /// Start listening.
    pub fn start(packs_dir: PathBuf) -> io::Result<Server> {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        let port = listener.local_addr()?.port();
        let token = random_token();
        let expected = token.clone();
        thread::spawn(move || {
            for stream in listener.incoming().flatten() {
                let (token, dir) = (expected.clone(), packs_dir.clone());
                thread::spawn(move || {
                    let _ = handle(stream, &token, &dir);
                });
            }
        });
        Ok(Server { port, token })
    }

    /// The base address the page's audio talks to.
    pub fn base_url(&self) -> String {
        format!("http://127.0.0.1:{}/{}", self.port, self.token)
    }
}

const CORS: &str = "Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\n";

fn respond(stream: &mut TcpStream, status: &str, kind: &str, body: &[u8]) -> io::Result<()> {
    write!(stream, "HTTP/1.1 {status}\r\n{CORS}Content-Type: {kind}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n", body.len())?;
    stream.write_all(body)
}

fn respond_json(stream: &mut TcpStream, status: &str, v: &Value) -> io::Result<()> {
    respond(stream, status, "application/json", v.to_string().as_bytes())
}

/// Names are `[A-Za-z0-9-]` only and files `[A-Za-z0-9-.]` only (no `..`), as in the Express route.
fn safe_name(s: &str) -> bool {
    !s.is_empty() && s.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
}
fn safe_file(s: &str) -> bool {
    s.chars().next().is_some_and(|c| c.is_ascii_alphanumeric()) && s.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.') && !s.contains("..")
}

fn handle(mut stream: TcpStream, token: &str, packs_dir: &Path) -> io::Result<()> {
    stream.set_read_timeout(Some(Duration::from_secs(30)))?;
    let mut buf = Vec::new();
    let mut chunk = [0u8; 65536];
    let head_end = loop {
        if let Some(i) = buf.windows(4).position(|w| w == b"\r\n\r\n") {
            break i + 4;
        }
        let n = stream.read(&mut chunk)?;
        if n == 0 || buf.len() > 64 * 1024 {
            return Ok(());
        }
        buf.extend_from_slice(&chunk[..n]);
    };
    let head = String::from_utf8_lossy(&buf[..head_end]).into_owned();
    let mut first = head.split("\r\n").next().unwrap_or("").split(' ');
    let (method, target) = (first.next().unwrap_or(""), first.next().unwrap_or(""));
    let length: usize = head
        .split("\r\n")
        .skip(1)
        .find_map(|l| {
            let (k, v) = l.split_once(':')?;
            k.eq_ignore_ascii_case("content-length").then(|| v.trim().parse().ok()).flatten()
        })
        .unwrap_or(0);
    if method == "OPTIONS" {
        return respond(&mut stream, "204 No Content", "text/plain", b"");
    }
    let path = target.split('?').next().unwrap_or("");
    let parts: Vec<&str> = path.trim_start_matches('/').split('/').collect();
    if parts.first() != Some(&token) {
        return respond(&mut stream, "404 Not Found", "text/plain", b"");
    }
    // a body can be a hundred megabytes of base64 (a long progression times loops): read it all
    let mut body = buf[head_end..].to_vec();
    if method == "POST" {
        body.reserve(length.saturating_sub(body.len()));
        while body.len() < length {
            let n = stream.read(&mut chunk)?;
            if n == 0 {
                break;
            }
            body.extend_from_slice(&chunk[..n]);
        }
    }

    match (method, &parts[1..]) {
        ("GET", ["packs"]) => {
            let index = packs_dir.join("packs.json");
            match fs::read(&index) {
                Ok(b) => respond(&mut stream, "200 OK", "application/json", &b),
                Err(_) => respond_json(&mut stream, "200 OK", &json!({ "format": 1, "packs": [] })),
            }
        }
        ("GET", ["pack", name, file]) => {
            if !safe_name(name) || !safe_file(file) {
                return respond_json(&mut stream, "400 Bad Request", &json!({ "error": "bad pack path" }));
            }
            match fs::read(packs_dir.join(name).join(file)) {
                Ok(b) => {
                    let kind = if file.ends_with(".json") { "application/json" } else { "application/octet-stream" };
                    respond(&mut stream, "200 OK", kind, &b)
                }
                Err(_) => respond_json(&mut stream, "404 Not Found", &json!({ "error": "not found" })),
            }
        }
        ("GET", ["soundfont"]) => respond_json(&mut stream, "404 Not Found", &json!({ "error": "soundfont not found" })),
        ("POST", ["save-seed"]) => {
            #[derive(Deserialize)]
            #[serde(rename_all = "camelCase", default)]
            struct Body {
                dir: String,
                name: String,
                audio_b64: String,
                audio_ext: String,
                midi_b64: String,
            }
            impl Default for Body {
                fn default() -> Self {
                    Body { dir: String::new(), name: String::new(), audio_b64: String::new(), audio_ext: String::new(), midi_b64: String::new() }
                }
            }
            let Ok(b) = serde_json::from_slice::<Body>(&body) else {
                return respond_json(&mut stream, "400 Bad Request", &json!({ "error": "dir and name required" }));
            };
            if b.dir.is_empty() || b.name.is_empty() {
                return respond_json(&mut stream, "400 Bad Request", &json!({ "error": "dir and name required" }));
            }
            let (Ok(audio), Ok(midi)) = (STANDARD.decode(&b.audio_b64), STANDARD.decode(&b.midi_b64)) else {
                return respond_json(&mut stream, "500 Internal Server Error", &json!({ "error": "bad base64" }));
            };
            match files::save_render(&b.dir, &b.name, &audio, &b.audio_ext, &midi) {
                Ok((a, m)) => respond_json(&mut stream, "200 OK", &json!({ "audioPath": a, "midiPath": m })),
                Err(e) => respond_json(&mut stream, "500 Internal Server Error", &json!({ "error": e })),
            }
        }
        _ => respond(&mut stream, "404 Not Found", "text/plain", b""),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(port: u16, method: &str, target: &str, body: &str) -> String {
        let mut s = TcpStream::connect(("127.0.0.1", port)).unwrap();
        write!(s, "{method} {target} HTTP/1.1\r\nHost: x\r\nContent-Length: {}\r\n\r\n{body}", body.len()).unwrap();
        let mut out = String::new();
        s.read_to_string(&mut out).unwrap();
        out
    }

    #[test]
    fn packs_and_render() {
        let dir = std::env::temp_dir().join(format!("amsr-server-{}", std::process::id()));
        fs::create_dir_all(dir.join("keys-x")).unwrap();
        fs::write(dir.join("packs.json"), r#"{"format":1,"packs":[]}"#).unwrap();
        fs::write(dir.join("keys-x").join("manifest.json"), "{}").unwrap();
        let server = Server::start(dir.clone()).unwrap();
        let t = server.token.clone();
        let p = server.port;

        assert!(request(p, "GET", &format!("/{t}/packs"), "").contains(r#""packs":[]"#));
        assert!(request(p, "GET", &format!("/{t}/pack/keys-x/manifest.json"), "").ends_with("{}"));
        assert!(request(p, "GET", &format!("/{t}/pack/keys-x/.."), "").contains("400"));
        assert!(request(p, "GET", "/nope/packs", "").starts_with("HTTP/1.1 404"));

        let out = dir.join("out");
        let body = format!(r#"{{"dir":{:?},"name":"s","audioB64":"UklGRg==","audioExt":"wav","midiB64":"TVRoZA=="}}"#, out.display().to_string());
        let answer = request(p, "POST", &format!("/{t}/save-seed"), &body);
        assert!(answer.contains("s.wav") && answer.contains("s.mid"), "{answer}");
        assert_eq!(fs::read(out.join("s.wav")).unwrap(), b"RIFF");

        let _ = fs::remove_dir_all(&dir);
    }
}

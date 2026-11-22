//! The files the app reads and writes: the `.yams` seed, the rendered audio and MIDI beside it, and the folder each file
//! dialog last used. The twin of the routes `/save-yams`, `/save-yams-as` (the write half), `/load-seed`, `/read-seed`,
//! `/save-seed` and of `dialog-memory.mjs` in the Electron app's main process.

use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

/// A `.yams` written as the Electron app writes it: `JSON.stringify(seed, null, 2)` (two spaces, no final newline).
pub fn write_yams(path: &str, seed: &Value) -> Result<(), String> {
    let text = serde_json::to_string_pretty(seed).map_err(|e| e.to_string())?;
    fs::write(path, text).map_err(|e| e.to_string())
}

/// A `.yams` read and parsed (`JSON.parse(fs.readFileSync(p, "utf8"))`).
pub fn read_yams(path: &str) -> Result<Value, String> {
    let text = fs::read_to_string(path).map_err(|e| e.to_string())?;
    // JSON.parse refuses a byte order mark; the Electron app would fail the same way
    serde_json::from_str(&text).map_err(|e| e.to_string())
}

/// Is this argument a `.yams` that exists (`isYams` in main.mjs)?
pub fn is_yams(arg: &str) -> bool {
    arg.to_lowercase().ends_with(".yams") && Path::new(arg).exists()
}

/// Write the rendered audio and MIDI to `<dir>/<name>.{mp3|wav,mid}`; the two paths come back (`/save-seed`).
pub fn save_render(dir: &str, name: &str, audio: &[u8], audio_ext: &str, midi: &[u8]) -> Result<(String, String), String> {
    if dir.is_empty() || name.is_empty() {
        return Err("dir and name required".to_owned());
    }
    let ext = if audio_ext == "mp3" { "mp3" } else { "wav" };
    fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let audio_path = Path::new(dir).join(format!("{name}.{ext}"));
    let midi_path = Path::new(dir).join(format!("{name}.mid"));
    fs::write(&audio_path, audio).map_err(|e| e.to_string())?;
    fs::write(&midi_path, midi).map_err(|e| e.to_string())?;
    Ok((audio_path.display().to_string(), midi_path.display().to_string()))
}

/// The folder a dialog last used, per dialog key, in `dialog-dirs.json` of the app's data folder
/// (`dialog-memory.mjs`: the same file name and shape, so the two apps would read each other's).
pub struct DialogDirs {
    file: PathBuf,
}

impl DialogDirs {
    pub fn new(data_dir: &Path) -> DialogDirs {
        DialogDirs { file: data_dir.join("dialog-dirs.json") }
    }

    fn load(&self) -> serde_json::Map<String, Value> {
        fs::read_to_string(&self.file).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default()
    }

    /// The folder to open a dialog in, or None on first use or when it is gone.
    pub fn last(&self, key: &str) -> Option<PathBuf> {
        let d = self.load();
        let dir = PathBuf::from(d.get(key)?.as_str()?);
        dir.exists().then_some(dir)
    }

    /// Record what the user picked (a file is reduced to its folder).
    pub fn remember(&self, key: &str, picked: &str) {
        let p = Path::new(picked);
        let dir = if p.is_dir() {
            p.to_path_buf()
        } else if p.exists() {
            match p.parent() {
                Some(d) => d.to_path_buf(),
                None => return,
            }
        } else {
            return;
        };
        let mut d = self.load();
        let dir_s = dir.display().to_string();
        if d.get(key).and_then(Value::as_str) == Some(dir_s.as_str()) {
            return;
        }
        d.insert(key.to_owned(), Value::String(dir_s));
        if let Ok(text) = serde_json::to_string_pretty(&Value::Object(d)) {
            let _ = fs::write(&self.file, text);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn yams_is_written_like_json_stringify() {
        let dir = std::env::temp_dir().join(format!("amsd-test-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        let p = dir.join("a.yams");
        let v: Value = serde_json::from_str(r#"{"version":3,"chords":"Am C\nG","bpm":80,"list":[],"o":{}}"#).unwrap();
        write_yams(p.to_str().unwrap(), &v).unwrap();
        let text = fs::read_to_string(&p).unwrap();
        assert_eq!(text, "{\n  \"version\": 3,\n  \"chords\": \"Am C\\nG\",\n  \"bpm\": 80,\n  \"list\": [],\n  \"o\": {}\n}");
        assert_eq!(read_yams(p.to_str().unwrap()).unwrap(), v);
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn render_files_land_beside_the_seed() {
        let dir = std::env::temp_dir().join(format!("amsd-test-r-{}", std::process::id()));
        let (a, m) = save_render(dir.to_str().unwrap(), "x", b"RIFF", "wav", b"MThd").unwrap();
        assert!(a.ends_with("x.wav") && m.ends_with("x.mid"));
        assert_eq!(fs::read(&a).unwrap(), b"RIFF");
        let _ = fs::remove_dir_all(&dir);
    }
}

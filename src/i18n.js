// ⚠ CLAUDE PRE-COMMIT GUARD - STOP before editing this file.
//   It holds every UI string, in every language. Do NOT hand-edit it: no empty
//   {} blocks, no copying values from another app, no pasting translations, no
//   "I'll fill the others later" - all of those are bugs. The only correct path
//   is the i18n key workflow: add keys in EN, then translate, sort and audit
//   across every language. Full procedure and exact commands: see CLAUDE-i18n.md.

import { useMemo } from 'react';

const TRANSLATIONS = {
  en: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Cancel",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "New version available:",
    lnkUpdateWhatsNew:                      "What's new",
    btnUpdateDownload:                      "Download",
    lnkUpdateSkip:                          "Skip this version",
    tipUpdateDismiss:                       "Dismiss",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Open settings",
    tipHdrHelp:                             "Help",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Settings",
    tabDlgSettingsDisplay:                  "Display",
    tabDlgSettingsAbout:                    "About",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Language",
    lblDlgSettingsDisplayTheme:             "Theme",
    btnDlgSettingsDisplayThemeDark:         "Dark",
    btnDlgSettingsDisplayThemeLight:        "Light",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "renders chord progressions to audio + MIDI seeds that constrain AI music generators like Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Chord progression",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "One bar per line: each line gets equal time, and the chords on it split that time evenly (a chord alone on a line holds the whole bar). [Section] tags, blank lines and | marks are ignored. Slash chords (C/G), 7ths (Gmaj7) and N.C. supported.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Bars per line",
    lblSeedSig:                             "Time signature",
    lblSeedLoops:                           "Loops",
    lblSeedStyle:                           "Style",
    lblSeedStyleGroupPads:                  "Pads",
    lblSeedStyleGroupArps:                  "Arpeggios",
    lblSeedStyleGroupGrooves:               "Grooves",
    optSeedStylePad:                        "Pad",
    optSeedStyleDrone:                      "Drone",
    optSeedStyleMarker:                     "Marker",
    optSeedStyleArpeggio1:                  "Arpeggio 1",
    optSeedStyleArpeggio2:                  "Arpeggio 2",
    optSeedStyleArpeggio3:                  "Arpeggio 3",
    optSeedStyleArpeggio4:                  "Arpeggio 4",
    optSeedStyleArpeggio5:                  "Arpeggio 5",
    optSeedStyleArpeggio6:                  "Arpeggio 6",
    optSeedStyleGroove1:                    "Groove 1",
    lblSeedKnobReverb:                      "reverb",
    lblSeedInstrument:                      "Treble",
    lblSeedBassInstrument:                  "Bass",
    optSeedBassInstrumentSame:              "Same as instrument",
    plhSeedInstrumentFilter:                "Type to filter…",
    optSeedInstrumentFamilyAll:             "All",
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music",
    tabSeedRender:                          "Render",
    lblSeedKnobVolume:                      "Volume",
    lblSeedKnobOctave:                      "Octave",
    lblSeedKnobTune:                        "Tune",
    tipSeedMute:                            "Mute",
    tipSeedUnmute:                          "Unmute",
    lblSeedReverb:                          "Reverb",
    optSeedReverbNone:                      "Dry: no room",
    optSeedReverbRoom:                      "Room: small and close",
    optSeedReverbChamber:                   "Chamber: medium, warm",
    optSeedReverbHall:                      "Hall: large and open",
    optSeedReverbChurch:                    "Church: very large, long tail",
    lblSeedReverbAmount:                    "Reverb amount",
    lblSeedHighpass:                        "Highpass (Hz)",
    lblSeedLowpass:                         "Lowpass (Hz)",
    optSeedInstrumentSine:                  "Sine: built-in synth",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitrate",
    lblSeedName:                            "Name",
    lblSeedOutput:                          "Output",
    hntSeedOutput:                          "Base name of the rendered files. Tokens replaced at render: {name}, {chords} (the first 8 chords), {style}, {instrument}, {instrument-treble}, {instrument-bass}, {bpm}, {loops}, {reverb-type}, {reverb-amount}, {highpass}, {lowpass}.",
    btnSeedRender:                          "Render seed",
    btnSeedPlay:                            "Play",
    btnSeedStop:                            "Stop",
    msgSeedPlayFailed:                      "Playback failed",
    hntSeedRenderNeedsSave:                 "Save the seed to a .yams file first — the audio is rendered next to it.",
    tipSeedLoad:                            "Load seed",
    ttlSeedLoad:                            "Open a seed file",
    lblSeedLoadFilter:                      "Seed file (.yams)",
    msgSeedLoadFailed:                      "Could not load that seed file",
    tipSeedNew:                             "New seed",
    tipSeedTabClose:                        "Close",
    lblSeedUntitled:                        "Untitled",
    tipSeedSave:                            "Save seed",
    tipSeedSaveAs:                          "Save seed as…",
    ttlSeedSaveAs:                          "Save seed as",
    msgSeedSaveFailed:                      "Could not save seed",
    msgSeedDropHere:                        "Drop a .yams seed file to load it",
    msgSeedBusy:                            "Rendering…",
    msgSeedEmpty:                           "Enter a chord progression first.",
    msgSeedFailed:                          "Render failed",
    lblSeedResult:                          "Saved",
    hntSeedResult:                          "Upload the audio seed to Suno (Cover). It follows the harmony it hears, not chord names you type.",
    msgSeedBusyInstrument:                  "Loading instrument…",
    msgSeedBusyRender:                      "Rendering audio…",
    msgSeedBusySave:                        "Saving…",
    lblSeedSummaryChords:                   "Chords",
    lblSeedSummaryDuration:                 "Duration",
    lblSeedSummarySize:                     "Est. size",
    msgSeedSummaryInvalid:                  "Unrecognised:",
    msgSeedSummarySigBad:                   "Invalid time signature",

    // ⚠ CLAUDE: do NOT add keys here - every key must belong to an existing Prefix block above. If no block fits, ask the user.
  },

  fr: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Annuler",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nouvelle version disponible :",
    lnkUpdateWhatsNew:                      "Nouveautés",
    btnUpdateDownload:                      "Télécharger",
    lnkUpdateSkip:                          "Ignorer cette version",
    tipUpdateDismiss:                       "Ignorer",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Ouvrir les paramètres",
    tipHdrHelp:                             "Aide",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Paramètres",
    tabDlgSettingsDisplay:                  "Affichage",
    tabDlgSettingsAbout:                    "À propos",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Langue",
    lblDlgSettingsDisplayTheme:             "Thème",
    btnDlgSettingsDisplayThemeDark:         "Sombre",
    btnDlgSettingsDisplayThemeLight:        "Clair",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Génère des progressions d'accords en graines audio + MIDI qui contraignent les générateurs de musique IA comme Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progression d'accords",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Une mesure par ligne : chaque ligne a la même durée, et les accords se la partagent équitablement (un accord seul occupe toute la mesure). Les balises [Section], lignes vides et | sont ignorées. Accords barrés (C/G), 7èmes (Gmaj7) et N.C. pris en charge.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Mesures par ligne",
    lblSeedSig:                             "Signature rythmique",
    lblSeedLoops:                           "Boucles",
    lblSeedStyle:                           "Style",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to fr
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to fr
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to fr
    optSeedStylePad:                        "Pad", // TODO: translate to fr
    optSeedStyleDrone:                      "Drone", // TODO: translate to fr
    optSeedStyleMarker:                     "Marker", // TODO: translate to fr
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to fr
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to fr
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to fr
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to fr
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to fr
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to fr
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to fr
    lblSeedKnobReverb:                      "reverb", // TODO: translate to fr
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to fr
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to fr
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to fr
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to fr
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to fr
    tabSeedRender:                          "Render", // TODO: translate to fr
    lblSeedKnobVolume:                      "Volume", // TODO: translate to fr
    lblSeedKnobOctave:                      "Octave", // TODO: translate to fr
    lblSeedKnobTune:                        "Tune", // TODO: translate to fr
    tipSeedMute:                            "Mute", // TODO: translate to fr
    tipSeedUnmute:                          "Unmute", // TODO: translate to fr
    lblSeedReverb:                          "Reverb", // TODO: translate to fr
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to fr
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to fr
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to fr
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to fr
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to fr
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to fr
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to fr
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to fr
    optSeedInstrumentSine:                  "Sinusoïde : synthé intégré",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Débit MP3",
    lblSeedName:                            "Nom",
    lblSeedOutput:                          "Sortie",
    hntSeedOutput:                          "Nom de base des fichiers rendus. Jetons remplacés au rendu : {name}, {chords} (les 8 premiers accords), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Rendre la source",
    btnSeedPlay:                            "Jouer",
    btnSeedStop:                            "Arrêter",
    msgSeedPlayFailed:                      "Échec de la lecture",
    hntSeedRenderNeedsSave:                 "Enregistrez la graine dans un fichier .yams d'abord — l'audio est rendu à côté.",
    tipSeedLoad:                            "Charger la graine",
    ttlSeedLoad:                            "Ouvrir un fichier de graine",
    lblSeedLoadFilter:                      "Fichier de graine (.yams)",
    msgSeedLoadFailed:                      "Impossible de charger ce fichier de graine",
    tipSeedNew:                             "Nouvelle graine",
    tipSeedTabClose:                        "Fermer",
    lblSeedUntitled:                        "Sans titre",
    tipSeedSave:                            "Sauvegarder la graine",
    tipSeedSaveAs:                          "Sauvegarder la graine sous…",
    ttlSeedSaveAs:                          "Sauvegarder la graine sous",
    msgSeedSaveFailed:                      "Impossible de sauvegarder la graine",
    msgSeedDropHere:                        "Déposez un fichier de graine .yams pour le charger",
    msgSeedBusy:                            "Rendu…",
    msgSeedEmpty:                           "Saisissez d'abord une progression d'accords.",
    msgSeedFailed:                          "Échec du rendu",
    lblSeedResult:                          "Enregistré",
    hntSeedResult:                          "Téléchargez la graine audio sur Suno (Cover). Il suit l'harmonie qu'il entend, pas les noms d'accords que vous tapez.",
    msgSeedBusyInstrument:                  "Chargement de l'instrument…",
    msgSeedBusyRender:                      "Rendu audio…",
    msgSeedBusySave:                        "Enregistrement…",
    lblSeedSummaryChords:                   "Accords",
    lblSeedSummaryDuration:                 "Durée",
    lblSeedSummarySize:                     "Taille est.",
    msgSeedSummaryInvalid:                  "Non reconnu :",
    msgSeedSummarySigBad:                   "Mesure invalide",

  },

  de: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Abbrechen",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Neue Version verfügbar:",
    lnkUpdateWhatsNew:                      "Was ist neu",
    btnUpdateDownload:                      "Herunterladen",
    lnkUpdateSkip:                          "Diese Version überspringen",
    tipUpdateDismiss:                       "Schließen",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Einstellungen öffnen",
    tipHdrHelp:                             "Hilfe",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Einstellungen",
    tabDlgSettingsDisplay:                  "Anzeige",
    tabDlgSettingsAbout:                    "Über",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Sprache",
    lblDlgSettingsDisplayTheme:             "Design",
    btnDlgSettingsDisplayThemeDark:         "Dunkel",
    btnDlgSettingsDisplayThemeLight:        "Hell",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Erzeugt Akkordfolgen als Audio- und MIDI-Seeds, die KI-Musikgeneratoren wie Suno einschränken.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akkordfolge",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Ein Takt pro Zeile: Jede Zeile erhält die gleiche Zeit, Akkorde teilen diese gleichmäßig auf (ein Akkord allein füllt den ganzen Takt). [Section]-Tags, Leerzeilen und | werden ignoriert. Slash-Akkorde (C/G), Septakkorde (Gmaj7) und N.C. werden unterstützt.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takte pro Zeile",
    lblSeedSig:                             "Taktart",
    lblSeedLoops:                           "Schleifen",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to de
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to de
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to de
    optSeedStylePad:                        "Pad", // TODO: translate to de
    optSeedStyleDrone:                      "Drone", // TODO: translate to de
    optSeedStyleMarker:                     "Marker", // TODO: translate to de
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to de
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to de
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to de
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to de
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to de
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to de
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to de
    lblSeedKnobReverb:                      "reverb", // TODO: translate to de
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to de
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to de
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to de
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to de
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to de
    tabSeedRender:                          "Render", // TODO: translate to de
    lblSeedKnobVolume:                      "Volume", // TODO: translate to de
    lblSeedKnobOctave:                      "Octave", // TODO: translate to de
    lblSeedKnobTune:                        "Tune", // TODO: translate to de
    tipSeedMute:                            "Mute", // TODO: translate to de
    tipSeedUnmute:                          "Unmute", // TODO: translate to de
    lblSeedReverb:                          "Reverb", // TODO: translate to de
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to de
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to de
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to de
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to de
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to de
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to de
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to de
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to de
    optSeedInstrumentSine:                  "Sinus: eingebauter Synth",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3-Bitrate",
    lblSeedName:                            "Name",
    lblSeedOutput:                          "Ausgabe",
    hntSeedOutput:                          "Basisname der gerenderten Dateien. Token, die beim Rendern ersetzt werden: {name}, {chords} (die ersten 8 Akkorde), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Seed rendern",
    btnSeedPlay:                            "Abspielen",
    btnSeedStop:                            "Stoppen",
    msgSeedPlayFailed:                      "Wiedergabe fehlgeschlagen",
    hntSeedRenderNeedsSave:                 "Speichern Sie den Seed zuerst in einer .yams-Datei — die Audioausgabe wird daneben gerendert.",
    tipSeedLoad:                            "Seed laden",
    ttlSeedLoad:                            "Seed-Datei öffnen",
    lblSeedLoadFilter:                      "Seed-Datei (.yams)",
    msgSeedLoadFailed:                      "Diese Seed-Datei konnte nicht geladen werden",
    tipSeedNew:                             "Neuer Seed",
    tipSeedTabClose:                        "Schließen",
    lblSeedUntitled:                        "Ohne Titel",
    tipSeedSave:                            "Seed speichern",
    tipSeedSaveAs:                          "Seed speichern unter…",
    ttlSeedSaveAs:                          "Seed speichern unter",
    msgSeedSaveFailed:                      "Seed konnte nicht gespeichert werden",
    msgSeedDropHere:                        "Ziehen Sie eine .yams Seed-Datei hierher, um sie zu laden",
    msgSeedBusy:                            "Rendert…",
    msgSeedEmpty:                           "Geben Sie zuerst eine Akkordfolge ein.",
    msgSeedFailed:                          "Rendern fehlgeschlagen",
    lblSeedResult:                          "Gespeichert",
    hntSeedResult:                          "Laden Sie den Audio-Seed zu Suno (Cover) hoch. Es folgt der Harmonie, die es hört, nicht den Akkordnamen, die Sie eingeben.",
    msgSeedBusyInstrument:                  "Instrument wird geladen…",
    msgSeedBusyRender:                      "Audio wird gerendert…",
    msgSeedBusySave:                        "Speichern…",
    lblSeedSummaryChords:                   "Akkorde",
    lblSeedSummaryDuration:                 "Dauer",
    lblSeedSummarySize:                     "Gesch. Größe",
    msgSeedSummaryInvalid:                  "Nicht erkannt:",
    msgSeedSummarySigBad:                   "Ungültige Taktart",

  },

  es: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Cancelar",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nueva versión disponible:",
    lnkUpdateWhatsNew:                      "Novedades",
    btnUpdateDownload:                      "Descargar",
    lnkUpdateSkip:                          "Omitir esta versión",
    tipUpdateDismiss:                       "Descartar",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Abrir configuración",
    tipHdrHelp:                             "Ayuda",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Configuración",
    tabDlgSettingsDisplay:                  "Pantalla",
    tabDlgSettingsAbout:                    "Acerca de",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Idioma",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Oscuro",
    btnDlgSettingsDisplayThemeLight:        "Claro",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genera progresiones de acordes a semillas de audio + MIDI que restringen generadores de música IA como Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progresión de acordes",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Una barra por línea: cada línea tiene la misma duración, y los acordes la dividen equitativamente (un acorde solo ocupa toda la barra). Las etiquetas [Section], líneas en blanco y | se ignoran. Acordes con barra (C/G), séptimas (Gmaj7) y N.C. compatibles.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Compases por línea",
    lblSeedSig:                             "Compás",
    lblSeedLoops:                           "Bucles",
    lblSeedStyle:                           "Estilo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to es
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to es
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to es
    optSeedStylePad:                        "Pad", // TODO: translate to es
    optSeedStyleDrone:                      "Drone", // TODO: translate to es
    optSeedStyleMarker:                     "Marker", // TODO: translate to es
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to es
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to es
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to es
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to es
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to es
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to es
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to es
    lblSeedKnobReverb:                      "reverb", // TODO: translate to es
    lblSeedInstrument:                      "Instrumento",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to es
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to es
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to es
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to es
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to es
    tabSeedRender:                          "Render", // TODO: translate to es
    lblSeedKnobVolume:                      "Volume", // TODO: translate to es
    lblSeedKnobOctave:                      "Octave", // TODO: translate to es
    lblSeedKnobTune:                        "Tune", // TODO: translate to es
    tipSeedMute:                            "Mute", // TODO: translate to es
    tipSeedUnmute:                          "Unmute", // TODO: translate to es
    lblSeedReverb:                          "Reverb", // TODO: translate to es
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to es
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to es
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to es
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to es
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to es
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to es
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to es
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to es
    optSeedInstrumentSine:                  "Seno: sintetizador integrado",
    lblSeedFormat:                          "Formato",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nombre",
    lblSeedOutput:                          "Salida",
    hntSeedOutput:                          "Nombre base de los archivos renderizados. Tokens reemplazados al renderizar: {name}, {chords} (los primeros 8 acordes), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderizar semilla",
    btnSeedPlay:                            "Reproducir",
    btnSeedStop:                            "Detener",
    msgSeedPlayFailed:                      "Fallo de reproducción",
    hntSeedRenderNeedsSave:                 "Guarde la semilla en un archivo .yams primero — el audio se renderiza junto a él.",
    tipSeedLoad:                            "Cargar semilla",
    ttlSeedLoad:                            "Abrir un archivo de semilla",
    lblSeedLoadFilter:                      "Archivo de semilla (.yams)",
    msgSeedLoadFailed:                      "No se pudo cargar ese archivo de semilla",
    tipSeedNew:                             "Nueva semilla",
    tipSeedTabClose:                        "Cerrar",
    lblSeedUntitled:                        "Sin título",
    tipSeedSave:                            "Guardar semilla",
    tipSeedSaveAs:                          "Guardar semilla como…",
    ttlSeedSaveAs:                          "Guardar semilla como",
    msgSeedSaveFailed:                      "No se pudo guardar la semilla",
    msgSeedDropHere:                        "Suelte un archivo de semilla .yams para cargarlo",
    msgSeedBusy:                            "Renderizando…",
    msgSeedEmpty:                           "Introduce primero una progresión de acordes.",
    msgSeedFailed:                          "Error al renderizar",
    lblSeedResult:                          "Guardado",
    hntSeedResult:                          "Sube la semilla de audio a Suno (Cover). Sigue la armonía que escucha, no los nombres de acordes que escribes.",
    msgSeedBusyInstrument:                  "Cargando instrumento…",
    msgSeedBusyRender:                      "Renderizando audio…",
    msgSeedBusySave:                        "Guardando…",
    lblSeedSummaryChords:                   "Acordes",
    lblSeedSummaryDuration:                 "Duración",
    lblSeedSummarySize:                     "Tamaño est.",
    msgSeedSummaryInvalid:                  "No reconocido:",
    msgSeedSummarySigBad:                   "Compás inválido",

  },

  pt_BR: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Cancelar",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nova versão disponível:",
    lnkUpdateWhatsNew:                      "Novidades",
    btnUpdateDownload:                      "Baixar",
    lnkUpdateSkip:                          "Pular esta versão",
    tipUpdateDismiss:                       "Dispensar",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Abrir configurações",
    tipHdrHelp:                             "Ajuda",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Configurações",
    tabDlgSettingsDisplay:                  "Exibição",
    tabDlgSettingsAbout:                    "Sobre",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Idioma",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Escuro",
    btnDlgSettingsDisplayThemeLight:        "Claro",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Gera progressões de acordes em sementes de áudio + MIDI que restringem geradores de música de IA como Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progressão de acordes",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Um compasso por linha: cada linha tem tempo igual, e os acordes dividem esse tempo uniformemente (um acorde sozinho ocupa o compasso inteiro). Tags [Section], linhas em branco e | são ignoradas. Acordes com barra (C/G), 7as (Gmaj7) e N.C. suportados.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Compassos por linha",
    lblSeedSig:                             "Compasso",
    lblSeedLoops:                           "Loops",
    lblSeedStyle:                           "Estilo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to pt_BR
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to pt_BR
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to pt_BR
    optSeedStylePad:                        "Pad", // TODO: translate to pt_BR
    optSeedStyleDrone:                      "Drone", // TODO: translate to pt_BR
    optSeedStyleMarker:                     "Marker", // TODO: translate to pt_BR
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to pt_BR
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to pt_BR
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to pt_BR
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to pt_BR
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to pt_BR
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to pt_BR
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to pt_BR
    lblSeedKnobReverb:                      "reverb", // TODO: translate to pt_BR
    lblSeedInstrument:                      "Instrumento",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to pt_BR
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to pt_BR
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to pt_BR
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to pt_BR
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to pt_BR
    tabSeedRender:                          "Render", // TODO: translate to pt_BR
    lblSeedKnobVolume:                      "Volume", // TODO: translate to pt_BR
    lblSeedKnobOctave:                      "Octave", // TODO: translate to pt_BR
    lblSeedKnobTune:                        "Tune", // TODO: translate to pt_BR
    tipSeedMute:                            "Mute", // TODO: translate to pt_BR
    tipSeedUnmute:                          "Unmute", // TODO: translate to pt_BR
    lblSeedReverb:                          "Reverb", // TODO: translate to pt_BR
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to pt_BR
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to pt_BR
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to pt_BR
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to pt_BR
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to pt_BR
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to pt_BR
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to pt_BR
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to pt_BR
    optSeedInstrumentSine:                  "Seno: sintetizador integrado",
    lblSeedFormat:                          "Formato",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nome",
    lblSeedOutput:                          "Saída",
    hntSeedOutput:                          "Nome base dos arquivos renderizados. Tokens substituídos na renderização: {name}, {chords} (os 8 primeiros acordes), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderizar semente",
    btnSeedPlay:                            "Reproduzir",
    btnSeedStop:                            "Parar",
    msgSeedPlayFailed:                      "Falha na reprodução",
    hntSeedRenderNeedsSave:                 "Salve a semente em um arquivo .yams primeiro — o áudio é renderizado ao lado dele.",
    tipSeedLoad:                            "Carregar semente",
    ttlSeedLoad:                            "Abrir um arquivo de semente",
    lblSeedLoadFilter:                      "Arquivo de semente (.yams)",
    msgSeedLoadFailed:                      "Não foi possível carregar esse arquivo de semente",
    tipSeedNew:                             "Nova semente",
    tipSeedTabClose:                        "Fechar",
    lblSeedUntitled:                        "Sem título",
    tipSeedSave:                            "Salvar semente",
    tipSeedSaveAs:                          "Salvar semente como…",
    ttlSeedSaveAs:                          "Salvar semente como",
    msgSeedSaveFailed:                      "Não foi possível salvar a semente",
    msgSeedDropHere:                        "Arraste um arquivo de semente .yams para carregá-lo",
    msgSeedBusy:                            "Renderizando…",
    msgSeedEmpty:                           "Insira uma progressão de acordes primeiro.",
    msgSeedFailed:                          "Falha ao renderizar",
    lblSeedResult:                          "Salvo",
    hntSeedResult:                          "Envie a semente de áudio para o Suno (Cover). Ele segue a harmonia que ouve, não os nomes de acordes que você digita.",
    msgSeedBusyInstrument:                  "Carregando instrumento…",
    msgSeedBusyRender:                      "Renderizando áudio…",
    msgSeedBusySave:                        "Salvando…",
    lblSeedSummaryChords:                   "Acordes",
    lblSeedSummaryDuration:                 "Duração",
    lblSeedSummarySize:                     "Tam. est.",
    msgSeedSummaryInvalid:                  "Não reconhecido:",
    msgSeedSummarySigBad:                   "Compasso inválido",

  },

  pt_PT: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Cancelar",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nova versão disponível:",
    lnkUpdateWhatsNew:                      "Novidades",
    btnUpdateDownload:                      "Transferir",
    lnkUpdateSkip:                          "Ignorar esta versão",
    tipUpdateDismiss:                       "Dispensar",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Abrir definições",
    tipHdrHelp:                             "Ajuda",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Definições",
    tabDlgSettingsDisplay:                  "Visualização",
    tabDlgSettingsAbout:                    "Acerca de",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Idioma",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Escuro",
    btnDlgSettingsDisplayThemeLight:        "Claro",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Gera progressões de acordes em sementes de áudio + MIDI que restringem geradores de música de IA como Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progressão de acordes",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Um compasso por linha: cada linha tem tempo igual, e os acordes dividem esse tempo uniformemente (um acorde sozinho ocupa o compasso inteiro). As tags [Section], linhas em branco e | são ignoradas. Acordes com barra (C/G), 7as (Gmaj7) e N.C. suportados.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Compassos por linha",
    lblSeedSig:                             "Compasso",
    lblSeedLoops:                           "Laços",
    lblSeedStyle:                           "Estilo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to pt_PT
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to pt_PT
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to pt_PT
    optSeedStylePad:                        "Pad", // TODO: translate to pt_PT
    optSeedStyleDrone:                      "Drone", // TODO: translate to pt_PT
    optSeedStyleMarker:                     "Marker", // TODO: translate to pt_PT
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to pt_PT
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to pt_PT
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to pt_PT
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to pt_PT
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to pt_PT
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to pt_PT
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to pt_PT
    lblSeedKnobReverb:                      "reverb", // TODO: translate to pt_PT
    lblSeedInstrument:                      "Instrumento",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to pt_PT
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to pt_PT
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to pt_PT
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to pt_PT
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to pt_PT
    tabSeedRender:                          "Render", // TODO: translate to pt_PT
    lblSeedKnobVolume:                      "Volume", // TODO: translate to pt_PT
    lblSeedKnobOctave:                      "Octave", // TODO: translate to pt_PT
    lblSeedKnobTune:                        "Tune", // TODO: translate to pt_PT
    tipSeedMute:                            "Mute", // TODO: translate to pt_PT
    tipSeedUnmute:                          "Unmute", // TODO: translate to pt_PT
    lblSeedReverb:                          "Reverb", // TODO: translate to pt_PT
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to pt_PT
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to pt_PT
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to pt_PT
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to pt_PT
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to pt_PT
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to pt_PT
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to pt_PT
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to pt_PT
    optSeedInstrumentSine:                  "Seno: sintetizador integrado",
    lblSeedFormat:                          "Formato",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nome",
    lblSeedOutput:                          "Saída",
    hntSeedOutput:                          "Nome base dos ficheiros renderizados. Tokens substituídos na renderização: {name}, {chords} (os 8 primeiros acordes), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderizar semente",
    btnSeedPlay:                            "Reproduzir",
    btnSeedStop:                            "Parar",
    msgSeedPlayFailed:                      "Falha na reprodução",
    hntSeedRenderNeedsSave:                 "Guarde a semente num ficheiro .yams primeiro — o áudio é renderizado ao lado.",
    tipSeedLoad:                            "Carregar semente",
    ttlSeedLoad:                            "Abrir um ficheiro de semente",
    lblSeedLoadFilter:                      "Ficheiro de semente (.yams)",
    msgSeedLoadFailed:                      "Não foi possível carregar esse ficheiro de semente",
    tipSeedNew:                             "Nova semente",
    tipSeedTabClose:                        "Fechar",
    lblSeedUntitled:                        "Sem título",
    tipSeedSave:                            "Guardar semente",
    tipSeedSaveAs:                          "Guardar semente como…",
    ttlSeedSaveAs:                          "Guardar semente como",
    msgSeedSaveFailed:                      "Não foi possível guardar a semente",
    msgSeedDropHere:                        "Arraste um ficheiro de semente .yams para o carregar",
    msgSeedBusy:                            "A renderizar…",
    msgSeedEmpty:                           "Introduza primeiro uma progressão de acordes.",
    msgSeedFailed:                          "Falha na renderização",
    lblSeedResult:                          "Guardado",
    hntSeedResult:                          "Carregue a semente de áudio para o Suno (Cover). Segue a harmonia que ouve, não os nomes de acordes que digita.",
    msgSeedBusyInstrument:                  "A carregar instrumento…",
    msgSeedBusyRender:                      "A renderizar áudio…",
    msgSeedBusySave:                        "A guardar…",
    lblSeedSummaryChords:                   "Acordes",
    lblSeedSummaryDuration:                 "Duração",
    lblSeedSummarySize:                     "Tam. est.",
    msgSeedSummaryInvalid:                  "Não reconhecido:",
    msgSeedSummarySigBad:                   "Compasso inválido",

  },

  it: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Annulla",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nuova versione disponibile:",
    lnkUpdateWhatsNew:                      "Novità",
    btnUpdateDownload:                      "Scarica",
    lnkUpdateSkip:                          "Salta questa versione",
    tipUpdateDismiss:                       "Ignora",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Apri impostazioni",
    tipHdrHelp:                             "Aiuto",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Impostazioni",
    tabDlgSettingsDisplay:                  "Schermo",
    tabDlgSettingsAbout:                    "Informazioni",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Lingua",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Scuro",
    btnDlgSettingsDisplayThemeLight:        "Chiaro",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genera progressioni di accordi in semi audio + MIDI che vincolano generatori di musica AI come Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progressione di accordi",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Una battuta per riga: ogni riga ha la stessa durata, e gli accordi la dividono equamente (un accordo da solo occupa l'intera battuta). I tag [Section], le righe vuote e i segni | vengono ignorati. Accordi slash (C/G), 7e (Gmaj7) e N.C. supportati.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Misure per riga",
    lblSeedSig:                             "Indicazione di tempo",
    lblSeedLoops:                           "Loop",
    lblSeedStyle:                           "Stile",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to it
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to it
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to it
    optSeedStylePad:                        "Pad", // TODO: translate to it
    optSeedStyleDrone:                      "Drone", // TODO: translate to it
    optSeedStyleMarker:                     "Marker", // TODO: translate to it
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to it
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to it
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to it
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to it
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to it
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to it
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to it
    lblSeedKnobReverb:                      "reverb", // TODO: translate to it
    lblSeedInstrument:                      "Strumento",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to it
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to it
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to it
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to it
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to it
    tabSeedRender:                          "Render", // TODO: translate to it
    lblSeedKnobVolume:                      "Volume", // TODO: translate to it
    lblSeedKnobOctave:                      "Octave", // TODO: translate to it
    lblSeedKnobTune:                        "Tune", // TODO: translate to it
    tipSeedMute:                            "Mute", // TODO: translate to it
    tipSeedUnmute:                          "Unmute", // TODO: translate to it
    lblSeedReverb:                          "Reverb", // TODO: translate to it
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to it
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to it
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to it
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to it
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to it
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to it
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to it
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to it
    optSeedInstrumentSine:                  "Onda sinusoidale: synth integrato",
    lblSeedFormat:                          "Formato",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nome",
    lblSeedOutput:                          "Output",
    hntSeedOutput:                          "Nome base dei file renderizzati. Token sostituiti al rendering: {name}, {chords} (i primi 8 accordi), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderizza seed",
    btnSeedPlay:                            "Riproduci",
    btnSeedStop:                            "Ferma",
    msgSeedPlayFailed:                      "Riproduzione fallita",
    hntSeedRenderNeedsSave:                 "Salva il seed in un file .yams prima — l'audio viene renderizzato accanto ad esso.",
    tipSeedLoad:                            "Carica seed",
    ttlSeedLoad:                            "Apri file seed",
    lblSeedLoadFilter:                      "File seed (.yams)",
    msgSeedLoadFailed:                      "Impossibile caricare quel file seed",
    tipSeedNew:                             "Nuovo seed",
    tipSeedTabClose:                        "Chiudi",
    lblSeedUntitled:                        "Senza titolo",
    tipSeedSave:                            "Salva seed",
    tipSeedSaveAs:                          "Salva seed con nome…",
    ttlSeedSaveAs:                          "Salva seed con nome",
    msgSeedSaveFailed:                      "Impossibile salvare il seed",
    msgSeedDropHere:                        "Trascina un file seed .yams per caricarlo",
    msgSeedBusy:                            "Rendering…",
    msgSeedEmpty:                           "Inserisci prima una progressione di accordi.",
    msgSeedFailed:                          "Rendering fallito",
    lblSeedResult:                          "Salvato",
    hntSeedResult:                          "Carica il seed audio su Suno (Cover). Segue l'armonia che sente, non i nomi degli accordi che digiti.",
    msgSeedBusyInstrument:                  "Caricamento strumento…",
    msgSeedBusyRender:                      "Rendering audio…",
    msgSeedBusySave:                        "Salvataggio…",
    lblSeedSummaryChords:                   "Accordi",
    lblSeedSummaryDuration:                 "Durata",
    lblSeedSummarySize:                     "Dim. stimata",
    msgSeedSummaryInvalid:                  "Non riconosciuto:",
    msgSeedSummarySigBad:                   "Metro invalido",

  },

  nl: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Annuleren",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nieuwe versie beschikbaar:",
    lnkUpdateWhatsNew:                      "Wat is nieuw",
    btnUpdateDownload:                      "Downloaden",
    lnkUpdateSkip:                          "Deze versie overslaan",
    tipUpdateDismiss:                       "Sluiten",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Instellingen openen",
    tipHdrHelp:                             "Hulp",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Instellingen",
    tabDlgSettingsDisplay:                  "Weergave",
    tabDlgSettingsAbout:                    "Over",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Taal",
    lblDlgSettingsDisplayTheme:             "Thema",
    btnDlgSettingsDisplayThemeDark:         "Donker",
    btnDlgSettingsDisplayThemeLight:        "Licht",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genereert akkoordprogressies als audio- en MIDI-seeds die AI-muziekgeneratoren zoals Suno beperken.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akkoordprogressie",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Eén maat per regel: elke regel krijgt gelijke tijd, en de akkoorden verdelen die tijd gelijkmatig (één akkoord op een regel vult de hele maat). [Section]-tags, lege regels en | worden genegeerd. Slash-akkoorden (C/G), 7e (Gmaj7) en N.C. worden ondersteund.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Maten per regel",
    lblSeedSig:                             "Maatsoort",
    lblSeedLoops:                           "Herhalingen",
    lblSeedStyle:                           "Stijl",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to nl
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to nl
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to nl
    optSeedStylePad:                        "Pad", // TODO: translate to nl
    optSeedStyleDrone:                      "Drone", // TODO: translate to nl
    optSeedStyleMarker:                     "Marker", // TODO: translate to nl
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to nl
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to nl
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to nl
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to nl
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to nl
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to nl
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to nl
    lblSeedKnobReverb:                      "reverb", // TODO: translate to nl
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to nl
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to nl
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to nl
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to nl
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to nl
    tabSeedRender:                          "Render", // TODO: translate to nl
    lblSeedKnobVolume:                      "Volume", // TODO: translate to nl
    lblSeedKnobOctave:                      "Octave", // TODO: translate to nl
    lblSeedKnobTune:                        "Tune", // TODO: translate to nl
    tipSeedMute:                            "Mute", // TODO: translate to nl
    tipSeedUnmute:                          "Unmute", // TODO: translate to nl
    lblSeedReverb:                          "Reverb", // TODO: translate to nl
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to nl
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to nl
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to nl
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to nl
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to nl
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to nl
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to nl
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to nl
    optSeedInstrumentSine:                  "Sinus: ingebouwde synth",
    lblSeedFormat:                          "Formaat",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3-bitrate",
    lblSeedName:                            "Naam",
    lblSeedOutput:                          "Uitvoer",
    hntSeedOutput:                          "Basisnaam van de gerenderde bestanden. Tokens vervangen bij renderen: {name}, {chords} (de eerste 8 akkoorden), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Seed renderen",
    btnSeedPlay:                            "Afspelen",
    btnSeedStop:                            "Stoppen",
    msgSeedPlayFailed:                      "Afspelen mislukt",
    hntSeedRenderNeedsSave:                 "Sla de seed eerst op in een .yams-bestand — de audio wordt ernaast gerenderd.",
    tipSeedLoad:                            "Seed laden",
    ttlSeedLoad:                            "Seed-bestand openen",
    lblSeedLoadFilter:                      "Seed-bestand (.yams)",
    msgSeedLoadFailed:                      "Kon dat seed-bestand niet laden",
    tipSeedNew:                             "Nieuwe seed",
    tipSeedTabClose:                        "Sluiten",
    lblSeedUntitled:                        "Naamloos",
    tipSeedSave:                            "Seed opslaan",
    tipSeedSaveAs:                          "Seed opslaan als…",
    ttlSeedSaveAs:                          "Seed opslaan als",
    msgSeedSaveFailed:                      "Seed kon niet worden opgeslagen",
    msgSeedDropHere:                        "Sleep een .yams seed-bestand hierheen om het te laden",
    msgSeedBusy:                            "Rendert…",
    msgSeedEmpty:                           "Voer eerst een akkoordprogressie in.",
    msgSeedFailed:                          "Renderafbeelding mislukt",
    lblSeedResult:                          "Opgeslagen",
    hntSeedResult:                          "Upload de audio-seed naar Suno (Cover). Het volgt de harmonie die het hoort, niet de akkoordnamen die je typt.",
    msgSeedBusyInstrument:                  "Instrument laden…",
    msgSeedBusyRender:                      "Audio renderen…",
    msgSeedBusySave:                        "Opslaan…",
    lblSeedSummaryChords:                   "Akkoorden",
    lblSeedSummaryDuration:                 "Duur",
    lblSeedSummarySize:                     "Gesch. grootte",
    msgSeedSummaryInvalid:                  "Niet herkend:",
    msgSeedSummarySigBad:                   "Ongeldige maatsoort",

  },

  ru: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Отмена",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Доступна новая версия:",
    lnkUpdateWhatsNew:                      "Что нового",
    btnUpdateDownload:                      "Скачать",
    lnkUpdateSkip:                          "Пропустить эту версию",
    tipUpdateDismiss:                       "Закрыть",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Открыть настройки",
    tipHdrHelp:                             "Справка",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Настройки",
    tabDlgSettingsDisplay:                  "Отображение",
    tabDlgSettingsAbout:                    "О программе",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Язык",
    lblDlgSettingsDisplayTheme:             "Тема",
    btnDlgSettingsDisplayThemeDark:         "Тёмный",
    btnDlgSettingsDisplayThemeLight:        "Светлый",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Создает аккордовые прогрессии в виде аудио- и MIDI-заготовок, ограничивающих ИИ-генераторы музыки, такие как Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Последовательность аккордов",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Один такт на строку: каждая строка получает равное время, и аккорды в ней делят это время поровну (один аккорд на строке занимает весь такт). Теги [Section], пустые строки и | игнорируются. Поддерживаются слэш-аккорды (C/G), септаккорды (Gmaj7) и N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Такты на строку",
    lblSeedSig:                             "Размер",
    lblSeedLoops:                           "Петли",
    lblSeedStyle:                           "Стиль",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ru
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ru
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ru
    optSeedStylePad:                        "Pad", // TODO: translate to ru
    optSeedStyleDrone:                      "Drone", // TODO: translate to ru
    optSeedStyleMarker:                     "Marker", // TODO: translate to ru
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ru
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ru
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ru
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ru
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ru
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ru
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ru
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ru
    lblSeedInstrument:                      "Инструмент",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ru
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ru
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ru
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ru
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ru
    tabSeedRender:                          "Render", // TODO: translate to ru
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ru
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ru
    lblSeedKnobTune:                        "Tune", // TODO: translate to ru
    tipSeedMute:                            "Mute", // TODO: translate to ru
    tipSeedUnmute:                          "Unmute", // TODO: translate to ru
    lblSeedReverb:                          "Reverb", // TODO: translate to ru
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ru
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ru
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ru
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ru
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ru
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ru
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ru
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ru
    optSeedInstrumentSine:                  "Синус: встроенный синтезатор",
    lblSeedFormat:                          "Формат",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Битрейт MP3",
    lblSeedName:                            "Имя",
    lblSeedOutput:                          "Вывод",
    hntSeedOutput:                          "Базовое имя рендеренных файлов. Токены, заменяемые при рендеринге: {name}, {chords} (первые 8 аккордов), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Рендерить сид",
    btnSeedPlay:                            "Воспроизвести",
    btnSeedStop:                            "Стоп",
    msgSeedPlayFailed:                      "Сбой воспроизведения",
    hntSeedRenderNeedsSave:                 "Сначала сохраните сид в файл .yams — аудио будет отрендерено рядом с ним.",
    tipSeedLoad:                            "Загрузить сид",
    ttlSeedLoad:                            "Открыть файл сида",
    lblSeedLoadFilter:                      "Файл сида (.yams)",
    msgSeedLoadFailed:                      "Не удалось загрузить этот файл сида",
    tipSeedNew:                             "Новый сид",
    tipSeedTabClose:                        "Закрыть",
    lblSeedUntitled:                        "Без названия",
    tipSeedSave:                            "Сохранить зерно",
    tipSeedSaveAs:                          "Сохранить зерно как…",
    ttlSeedSaveAs:                          "Сохранить зерно как",
    msgSeedSaveFailed:                      "Не удалось сохранить зерно",
    msgSeedDropHere:                        "Перетащите файл .yams seed для загрузки",
    msgSeedBusy:                            "Рендеринг…",
    msgSeedEmpty:                           "Сначала введите последовательность аккордов.",
    msgSeedFailed:                          "Ошибка рендеринга",
    lblSeedResult:                          "Сохранено",
    hntSeedResult:                          "Загрузите аудио-исходник в Suno (Cover). Он следует гармонии, которую слышит, а не названиям аккордов, которые вы вводите.",
    msgSeedBusyInstrument:                  "Загрузка инструмента…",
    msgSeedBusyRender:                      "Рендеринг аудио…",
    msgSeedBusySave:                        "Сохранение…",
    lblSeedSummaryChords:                   "Аккорды",
    lblSeedSummaryDuration:                 "Длительность",
    lblSeedSummarySize:                     "Прим. размер",
    msgSeedSummaryInvalid:                  "Не распознано:",
    msgSeedSummarySigBad:                   "Неверный размер",

  },

  uk: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Скасувати",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Доступна нова версія:",
    lnkUpdateWhatsNew:                      "Що нового",
    btnUpdateDownload:                      "Завантажити",
    lnkUpdateSkip:                          "Пропустити цю версію",
    tipUpdateDismiss:                       "Закрити",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Відкрити налаштування",
    tipHdrHelp:                             "Довідка",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Налаштування",
    tabDlgSettingsDisplay:                  "Відображення",
    tabDlgSettingsAbout:                    "Про програму",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Мова",
    lblDlgSettingsDisplayTheme:             "Тема",
    btnDlgSettingsDisplayThemeDark:         "Темний",
    btnDlgSettingsDisplayThemeLight:        "Світлий",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Створює акордові прогресії як аудіо- та MIDI-заготовки, що обмежують ШІ-генератори музики, наприклад Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Послідовність акордів",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Один такт на рядок: кожен рядок отримує рівний час, і акорди в ньому ділять цей час порівну (один акорд на рядку займає весь такт). Теги [Section], порожні рядки та | ігноруються. Підтримуються слеш-акорди (C/G), септакорди (Gmaj7) та N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Такти на рядок",
    lblSeedSig:                             "Розмір",
    lblSeedLoops:                           "Петлі",
    lblSeedStyle:                           "Стиль",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to uk
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to uk
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to uk
    optSeedStylePad:                        "Pad", // TODO: translate to uk
    optSeedStyleDrone:                      "Drone", // TODO: translate to uk
    optSeedStyleMarker:                     "Marker", // TODO: translate to uk
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to uk
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to uk
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to uk
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to uk
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to uk
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to uk
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to uk
    lblSeedKnobReverb:                      "reverb", // TODO: translate to uk
    lblSeedInstrument:                      "Інструмент",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to uk
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to uk
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to uk
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to uk
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to uk
    tabSeedRender:                          "Render", // TODO: translate to uk
    lblSeedKnobVolume:                      "Volume", // TODO: translate to uk
    lblSeedKnobOctave:                      "Octave", // TODO: translate to uk
    lblSeedKnobTune:                        "Tune", // TODO: translate to uk
    tipSeedMute:                            "Mute", // TODO: translate to uk
    tipSeedUnmute:                          "Unmute", // TODO: translate to uk
    lblSeedReverb:                          "Reverb", // TODO: translate to uk
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to uk
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to uk
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to uk
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to uk
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to uk
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to uk
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to uk
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to uk
    optSeedInstrumentSine:                  "Синус: вбудований синтезатор",
    lblSeedFormat:                          "Формат",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Бітрейт MP3",
    lblSeedName:                            "Назва",
    lblSeedOutput:                          "Вивід",
    hntSeedOutput:                          "Базова назва відрендерених файлів. Токени, що замінюються при рендерингу: {name}, {chords} (перші 8 акордів), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Рендерити сід",
    btnSeedPlay:                            "Відтворити",
    btnSeedStop:                            "Зупинити",
    msgSeedPlayFailed:                      "Помилка відтворення",
    hntSeedRenderNeedsSave:                 "Спершу збережіть сід у файл .yams — аудіо буде відрендерено поруч із ним.",
    tipSeedLoad:                            "Завантажити сід",
    ttlSeedLoad:                            "Відкрити файл сіда",
    lblSeedLoadFilter:                      "Файл сіда (.yams)",
    msgSeedLoadFailed:                      "Не вдалося завантажити цей файл сіда",
    tipSeedNew:                             "Новий сід",
    tipSeedTabClose:                        "Закрити",
    lblSeedUntitled:                        "Без назви",
    tipSeedSave:                            "Зберегти зерно",
    tipSeedSaveAs:                          "Зберегти зерно як…",
    ttlSeedSaveAs:                          "Зберегти зерно як",
    msgSeedSaveFailed:                      "Не вдалося зберегти зерно",
    msgSeedDropHere:                        "Перетягніть файл .yams seed, щоб завантажити його",
    msgSeedBusy:                            "Рендеринг…",
    msgSeedEmpty:                           "Спершу введіть послідовність акордів.",
    msgSeedFailed:                          "Помилка рендерингу",
    lblSeedResult:                          "Збережено",
    hntSeedResult:                          "Завантажте аудіо-затравку в Suno (Cover). Він слідує гармонії, яку чує, а не назвам акордів, які ви вводите.",
    msgSeedBusyInstrument:                  "Завантаження інструменту…",
    msgSeedBusyRender:                      "Рендеринг аудіо…",
    msgSeedBusySave:                        "Збереження…",
    lblSeedSummaryChords:                   "Акорди",
    lblSeedSummaryDuration:                 "Тривалість",
    lblSeedSummarySize:                     "Прибл. розмір",
    msgSeedSummaryInvalid:                  "Не розпізнано:",
    msgSeedSummarySigBad:                   "Недійсний розмір",

  },

  pl: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Anuluj",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Dostępna nowa wersja:",
    lnkUpdateWhatsNew:                      "Co nowego",
    btnUpdateDownload:                      "Pobierz",
    lnkUpdateSkip:                          "Pomiń tę wersję",
    tipUpdateDismiss:                       "Zamknij",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Otwórz ustawienia",
    tipHdrHelp:                             "Pomoc",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Ustawienia",
    tabDlgSettingsDisplay:                  "Wyświetlanie",
    tabDlgSettingsAbout:                    "O programie",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Język",
    lblDlgSettingsDisplayTheme:             "Motyw",
    btnDlgSettingsDisplayThemeDark:         "Ciemny",
    btnDlgSettingsDisplayThemeLight:        "Jasny",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Generuje progresje akordów jako nasiona audio + MIDI, które ograniczają generatory muzyki AI, takie jak Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Postęp akordów",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Jeden takt na linię: każda linia ma równy czas, a akordy dzielą go równomiernie (pojedynczy akord na linii zajmuje cały takt). Tagi [Section], puste linie i | są ignorowane. Obsługiwane akordy ukośnikowe (C/G), septymowe (Gmaj7) i N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takty na linię",
    lblSeedSig:                             "Metrum",
    lblSeedLoops:                           "Pętle",
    lblSeedStyle:                           "Styl",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to pl
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to pl
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to pl
    optSeedStylePad:                        "Pad", // TODO: translate to pl
    optSeedStyleDrone:                      "Drone", // TODO: translate to pl
    optSeedStyleMarker:                     "Marker", // TODO: translate to pl
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to pl
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to pl
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to pl
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to pl
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to pl
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to pl
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to pl
    lblSeedKnobReverb:                      "reverb", // TODO: translate to pl
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to pl
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to pl
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to pl
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to pl
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to pl
    tabSeedRender:                          "Render", // TODO: translate to pl
    lblSeedKnobVolume:                      "Volume", // TODO: translate to pl
    lblSeedKnobOctave:                      "Octave", // TODO: translate to pl
    lblSeedKnobTune:                        "Tune", // TODO: translate to pl
    tipSeedMute:                            "Mute", // TODO: translate to pl
    tipSeedUnmute:                          "Unmute", // TODO: translate to pl
    lblSeedReverb:                          "Reverb", // TODO: translate to pl
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to pl
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to pl
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to pl
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to pl
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to pl
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to pl
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to pl
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to pl
    optSeedInstrumentSine:                  "Sinus: wbudowany syntezator",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nazwa",
    lblSeedOutput:                          "Wyjście",
    hntSeedOutput:                          "Nazwa bazowa renderowanych plików. Tokeny zastępowane podczas renderowania: {name}, {chords} (pierwsze 8 akordów), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderuj seed",
    btnSeedPlay:                            "Odtwórz",
    btnSeedStop:                            "Zatrzymaj",
    msgSeedPlayFailed:                      "Odtwarzanie nie powiodło się",
    hntSeedRenderNeedsSave:                 "Najpierw zapisz seed do pliku .yams — dźwięk zostanie wyrenderowany obok niego.",
    tipSeedLoad:                            "Wczytaj seed",
    ttlSeedLoad:                            "Otwórz plik seed",
    lblSeedLoadFilter:                      "Plik seed (.yams)",
    msgSeedLoadFailed:                      "Nie można było wczytać tego pliku seed",
    tipSeedNew:                             "Nowy seed",
    tipSeedTabClose:                        "Zamknij",
    lblSeedUntitled:                        "Bez tytułu",
    tipSeedSave:                            "Zapisz ziarno",
    tipSeedSaveAs:                          "Zapisz ziarno jako…",
    ttlSeedSaveAs:                          "Zapisz ziarno jako",
    msgSeedSaveFailed:                      "Nie można było zapisać ziarna",
    msgSeedDropHere:                        "Upuść plik .yams seed, aby go załadować",
    msgSeedBusy:                            "Renderowanie…",
    msgSeedEmpty:                           "Najpierw wprowadź progresję akordów.",
    msgSeedFailed:                          "Renderowanie nie powiodło się",
    lblSeedResult:                          "Zapisano",
    hntSeedResult:                          "Prześlij ziarno audio do Suno (Cover). Podąża za harmonią, którą słyszy, a nie nazwami akordów, które wpisujesz.",
    msgSeedBusyInstrument:                  "Ładowanie instrumentu…",
    msgSeedBusyRender:                      "Renderowanie audio…",
    msgSeedBusySave:                        "Zapisywanie…",
    lblSeedSummaryChords:                   "Akordy",
    lblSeedSummaryDuration:                 "Czas trwania",
    lblSeedSummarySize:                     "Szac. rozmiar",
    msgSeedSummaryInvalid:                  "Nierozpoznane:",
    msgSeedSummarySigBad:                   "Nieprawidłowe metrum",

  },

  ro: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Anulează",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Versiune nouă disponibilă:",
    lnkUpdateWhatsNew:                      "Ce e nou",
    btnUpdateDownload:                      "Descarcă",
    lnkUpdateSkip:                          "Omite această versiune",
    tipUpdateDismiss:                       "Ignoră",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Deschide setările",
    tipHdrHelp:                             "Ajutor",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Setări",
    tabDlgSettingsDisplay:                  "Afișaj",
    tabDlgSettingsAbout:                    "Despre",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Limbă",
    lblDlgSettingsDisplayTheme:             "Temă",
    btnDlgSettingsDisplayThemeDark:         "Întunecat",
    btnDlgSettingsDisplayThemeLight:        "Luminos",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Generează progresii de acorduri în semințe audio + MIDI care constrâng generatoarele de muzică AI precum Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progresie de acorduri",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "O măsură pe linie: fiecare linie primește timp egal, iar acordurile o împart uniform (un acord singur pe linie ocupă întreaga măsură). Tag-urile [Section], liniile goale și | sunt ignorate. Acorduri slash (C/G), 7ths (Gmaj7) și N.C. sunt suportate.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Măsuri pe linie",
    lblSeedSig:                             "Măsură",
    lblSeedLoops:                           "Bucle",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ro
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ro
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ro
    optSeedStylePad:                        "Pad", // TODO: translate to ro
    optSeedStyleDrone:                      "Drone", // TODO: translate to ro
    optSeedStyleMarker:                     "Marker", // TODO: translate to ro
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ro
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ro
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ro
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ro
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ro
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ro
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ro
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ro
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ro
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ro
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ro
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ro
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ro
    tabSeedRender:                          "Render", // TODO: translate to ro
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ro
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ro
    lblSeedKnobTune:                        "Tune", // TODO: translate to ro
    tipSeedMute:                            "Mute", // TODO: translate to ro
    tipSeedUnmute:                          "Unmute", // TODO: translate to ro
    lblSeedReverb:                          "Reverb", // TODO: translate to ro
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ro
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ro
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ro
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ro
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ro
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ro
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ro
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ro
    optSeedInstrumentSine:                  "Sinus: sintetizator încorporat",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nume",
    lblSeedOutput:                          "Ieșire",
    hntSeedOutput:                          "Numele de bază al fișierelor redate. Tokenuri înlocuite la redare: {name}, {chords} (primele 8 acorduri), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Randează seed-ul",
    btnSeedPlay:                            "Redare",
    btnSeedStop:                            "Oprește",
    msgSeedPlayFailed:                      "Redare eșuată",
    hntSeedRenderNeedsSave:                 "Salvați seed-ul într-un fișier .yams mai întâi — sunetul este redat lângă el.",
    tipSeedLoad:                            "Încarcă seed",
    ttlSeedLoad:                            "Deschide fișier seed",
    lblSeedLoadFilter:                      "Fișier seed (.yams)",
    msgSeedLoadFailed:                      "Nu s-a putut încărca acel fișier seed",
    tipSeedNew:                             "Seed nou",
    tipSeedTabClose:                        "Închide",
    lblSeedUntitled:                        "Fără titlu",
    tipSeedSave:                            "Salvează seed",
    tipSeedSaveAs:                          "Salvează seed ca…",
    ttlSeedSaveAs:                          "Salvează seed ca",
    msgSeedSaveFailed:                      "Nu s-a putut salva seed-ul",
    msgSeedDropHere:                        "Trageți un fișier .yams seed pentru a-l încărca",
    msgSeedBusy:                            "Se randează…",
    msgSeedEmpty:                           "Introduceți mai întâi o progresie de acorduri.",
    msgSeedFailed:                          "Randare eșuată",
    lblSeedResult:                          "Salvat",
    hntSeedResult:                          "Încarcă seed-ul audio pe Suno (Cover). Urmează armonia pe care o aude, nu numele acordurilor pe care le tastezi.",
    msgSeedBusyInstrument:                  "Se încarcă instrumentul…",
    msgSeedBusyRender:                      "Randare audio…",
    msgSeedBusySave:                        "Se salvează…",
    lblSeedSummaryChords:                   "Acorduri",
    lblSeedSummaryDuration:                 "Durată",
    lblSeedSummarySize:                     "Dim. estimată",
    msgSeedSummaryInvalid:                  "Nerecunoscut:",
    msgSeedSummarySigBad:                   "Măsură invalidă",

  },

  sv: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Avbryt",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Ny version tillgänglig:",
    lnkUpdateWhatsNew:                      "Vad är nytt",
    btnUpdateDownload:                      "Ladda ner",
    lnkUpdateSkip:                          "Hoppa över den här versionen",
    tipUpdateDismiss:                       "Avfärda",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Öppna inställningar",
    tipHdrHelp:                             "Hjälp",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Inställningar",
    tabDlgSettingsDisplay:                  "Visning",
    tabDlgSettingsAbout:                    "Om",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Språk",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Mörk",
    btnDlgSettingsDisplayThemeLight:        "Ljus",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genererar ackordföljder som ljud- och MIDI-frön som begränsar AI-musikgeneratorer som Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Ackordföljd",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "En takt per rad: varje rad får lika lång tid, och ackorden på den delar tiden jämnt (ett ackord ensamt på en rad tar hela takten). [Section]-taggar, tomma rader och | ignoreras. Slash-ackord (C/G), 7:or (Gmaj7) och N.C. stöds.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takter per rad",
    lblSeedSig:                             "Taktart",
    lblSeedLoops:                           "Loopar",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to sv
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to sv
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to sv
    optSeedStylePad:                        "Pad", // TODO: translate to sv
    optSeedStyleDrone:                      "Drone", // TODO: translate to sv
    optSeedStyleMarker:                     "Marker", // TODO: translate to sv
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to sv
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to sv
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to sv
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to sv
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to sv
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to sv
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to sv
    lblSeedKnobReverb:                      "reverb", // TODO: translate to sv
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to sv
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to sv
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to sv
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to sv
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to sv
    tabSeedRender:                          "Render", // TODO: translate to sv
    lblSeedKnobVolume:                      "Volume", // TODO: translate to sv
    lblSeedKnobOctave:                      "Octave", // TODO: translate to sv
    lblSeedKnobTune:                        "Tune", // TODO: translate to sv
    tipSeedMute:                            "Mute", // TODO: translate to sv
    tipSeedUnmute:                          "Unmute", // TODO: translate to sv
    lblSeedReverb:                          "Reverb", // TODO: translate to sv
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to sv
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to sv
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to sv
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to sv
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to sv
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to sv
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to sv
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to sv
    optSeedInstrumentSine:                  "Sinus: inbyggd synt",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3-bitrate",
    lblSeedName:                            "Namn",
    lblSeedOutput:                          "Utdata",
    hntSeedOutput:                          "Basnamn för de renderade filerna. Token som ersätts vid rendering: {name}, {chords} (de första 8 ackorden), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Rendera seed",
    btnSeedPlay:                            "Spela upp",
    btnSeedStop:                            "Stoppa",
    msgSeedPlayFailed:                      "Uppspelning misslyckades",
    hntSeedRenderNeedsSave:                 "Spara seedet till en .yams-fil först — ljudet renderas bredvid den.",
    tipSeedLoad:                            "Ladda seed",
    ttlSeedLoad:                            "Öppna seed-fil",
    lblSeedLoadFilter:                      "Seed-fil (.yams)",
    msgSeedLoadFailed:                      "Kunde inte ladda den seed-filen",
    tipSeedNew:                             "Nytt frö",
    tipSeedTabClose:                        "Stäng",
    lblSeedUntitled:                        "Namnlös",
    tipSeedSave:                            "Spara seed",
    tipSeedSaveAs:                          "Spara seed som…",
    ttlSeedSaveAs:                          "Spara seed som",
    msgSeedSaveFailed:                      "Kunde inte spara seed",
    msgSeedDropHere:                        "Släpp en .yams seed-fil för att ladda den",
    msgSeedBusy:                            "Renderar…",
    msgSeedEmpty:                           "Ange först en ackordföljd.",
    msgSeedFailed:                          "Renderingsfel",
    lblSeedResult:                          "Sparat",
    hntSeedResult:                          "Ladda upp ljudfröet till Suno (Cover). Den följer harmonin den hör, inte ackordnamnen du skriver.",
    msgSeedBusyInstrument:                  "Laddar instrument…",
    msgSeedBusyRender:                      "Renderar ljud…",
    msgSeedBusySave:                        "Sparar…",
    lblSeedSummaryChords:                   "Ackord",
    lblSeedSummaryDuration:                 "Varaktighet",
    lblSeedSummarySize:                     "Uppsk. storlek",
    msgSeedSummaryInvalid:                  "Okänd:",
    msgSeedSummarySigBad:                   "Ogiltig taktart",

  },

  nb: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Avbryt",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Ny versjon tilgjengelig:",
    lnkUpdateWhatsNew:                      "Hva er nytt",
    btnUpdateDownload:                      "Last ned",
    lnkUpdateSkip:                          "Hopp over denne versjonen",
    tipUpdateDismiss:                       "Avvis",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Åpne innstillinger",
    tipHdrHelp:                             "Hjelp",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Innstillinger",
    tabDlgSettingsDisplay:                  "Skjerm",
    tabDlgSettingsAbout:                    "Om",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Språk",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Mørk",
    btnDlgSettingsDisplayThemeLight:        "Lys",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genererer akkordprogresjoner som lyd- og MIDI-frø som begrenser AI-musikgeneratorer som Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akkordprogresjon",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Én takt per linje: hver linje får lik tid, og akkordene på den deler tiden jevnt (en akkord alene på en linje holder hele takten). [Section]-tagger, tomme linjer og | ignoreres. Skråstrekakkorder (C/G), 7-ere (Gmaj7) og N.C. støttes.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takter per linje",
    lblSeedSig:                             "Taktart",
    lblSeedLoops:                           "Looper",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to nb
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to nb
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to nb
    optSeedStylePad:                        "Pad", // TODO: translate to nb
    optSeedStyleDrone:                      "Drone", // TODO: translate to nb
    optSeedStyleMarker:                     "Marker", // TODO: translate to nb
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to nb
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to nb
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to nb
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to nb
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to nb
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to nb
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to nb
    lblSeedKnobReverb:                      "reverb", // TODO: translate to nb
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to nb
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to nb
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to nb
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to nb
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to nb
    tabSeedRender:                          "Render", // TODO: translate to nb
    lblSeedKnobVolume:                      "Volume", // TODO: translate to nb
    lblSeedKnobOctave:                      "Octave", // TODO: translate to nb
    lblSeedKnobTune:                        "Tune", // TODO: translate to nb
    tipSeedMute:                            "Mute", // TODO: translate to nb
    tipSeedUnmute:                          "Unmute", // TODO: translate to nb
    lblSeedReverb:                          "Reverb", // TODO: translate to nb
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to nb
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to nb
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to nb
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to nb
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to nb
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to nb
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to nb
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to nb
    optSeedInstrumentSine:                  "Sinus: innebygd synth",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3-bitrate",
    lblSeedName:                            "Navn",
    lblSeedOutput:                          "Utdata",
    hntSeedOutput:                          "Grunnnavn for de renderte filene. Tokens som erstattes ved rendering: {name}, {chords} (de første 8 akkordene), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Rendrer seed",
    btnSeedPlay:                            "Spill av",
    btnSeedStop:                            "Stopp",
    msgSeedPlayFailed:                      "Avspilling mislyktes",
    hntSeedRenderNeedsSave:                 "Lagre seedet til en .yams-fil først — lyden gjengis ved siden av den.",
    tipSeedLoad:                            "Last inn seed",
    ttlSeedLoad:                            "Åpne seed-fil",
    lblSeedLoadFilter:                      "Seed-fil (.yams)",
    msgSeedLoadFailed:                      "Kunne ikke laste inn den seed-filen",
    tipSeedNew:                             "Nytt frø",
    tipSeedTabClose:                        "Lukk",
    lblSeedUntitled:                        "Uten tittel",
    tipSeedSave:                            "Lagre seed",
    tipSeedSaveAs:                          "Lagre seed som…",
    ttlSeedSaveAs:                          "Lagre seed som",
    msgSeedSaveFailed:                      "Kunne ikke lagre seed",
    msgSeedDropHere:                        "Slipp en .yams seed-fil for å laste den",
    msgSeedBusy:                            "Rendrer…",
    msgSeedEmpty:                           "Skriv inn en akkordprogresjon først.",
    msgSeedFailed:                          "Gjengivelse mislyktes",
    lblSeedResult:                          "Lagret",
    hntSeedResult:                          "Last opp lydfrøet til Suno (Cover). Den følger harmonien den hører, ikke akkordnavnene du skriver.",
    msgSeedBusyInstrument:                  "Laster instrument…",
    msgSeedBusyRender:                      "Rendrer lyd…",
    msgSeedBusySave:                        "Lagrer…",
    lblSeedSummaryChords:                   "Akkorder",
    lblSeedSummaryDuration:                 "Varighet",
    lblSeedSummarySize:                     "Est. størrelse",
    msgSeedSummaryInvalid:                  "Ukjent:",
    msgSeedSummarySigBad:                   "Ugyldig taktart",

  },

  tr: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "İptal",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Yeni sürüm mevcut:",
    lnkUpdateWhatsNew:                      "Yenilikler",
    btnUpdateDownload:                      "İndir",
    lnkUpdateSkip:                          "Bu sürümü atla",
    tipUpdateDismiss:                       "Kapat",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Ayarları aç",
    tipHdrHelp:                             "Yardım",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Ayarlar",
    tabDlgSettingsDisplay:                  "Görüntü",
    tabDlgSettingsAbout:                    "Hakkında",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Dil",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Koyu",
    btnDlgSettingsDisplayThemeLight:        "Açık",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Akor ilerlemelerini, Suno gibi yapay zeka müzik jeneratörlerini kısıtlayan ses + MIDI tohumlarına dönüştürür.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akort ilerlemesi",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Satır başına bir ölçü: her satır eşit süre alır ve üzerindeki akorlar bu süreyi eşit olarak paylaşır (bir satırdaki tek akor tüm ölçüyü kaplar). [Section] etiketleri, boş satırlar ve | işaretleri yok sayılır. Bölü akorlar (C/G), 7'liler (Gmaj7) ve N.C. desteklenir.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Satır başına ölçü",
    lblSeedSig:                             "Zaman işareti",
    lblSeedLoops:                           "Döngüler",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to tr
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to tr
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to tr
    optSeedStylePad:                        "Pad", // TODO: translate to tr
    optSeedStyleDrone:                      "Drone", // TODO: translate to tr
    optSeedStyleMarker:                     "Marker", // TODO: translate to tr
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to tr
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to tr
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to tr
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to tr
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to tr
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to tr
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to tr
    lblSeedKnobReverb:                      "reverb", // TODO: translate to tr
    lblSeedInstrument:                      "Enstrüman",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to tr
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to tr
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to tr
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to tr
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to tr
    tabSeedRender:                          "Render", // TODO: translate to tr
    lblSeedKnobVolume:                      "Volume", // TODO: translate to tr
    lblSeedKnobOctave:                      "Octave", // TODO: translate to tr
    lblSeedKnobTune:                        "Tune", // TODO: translate to tr
    tipSeedMute:                            "Mute", // TODO: translate to tr
    tipSeedUnmute:                          "Unmute", // TODO: translate to tr
    lblSeedReverb:                          "Reverb", // TODO: translate to tr
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to tr
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to tr
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to tr
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to tr
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to tr
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to tr
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to tr
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to tr
    optSeedInstrumentSine:                  "Sinüs: dahili sentezleyici",
    lblSeedFormat:                          "Biçim",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bit hızı",
    lblSeedName:                            "Ad",
    lblSeedOutput:                          "Çıktı",
    hntSeedOutput:                          "Oluşturulan dosyaların temel adı. Oluşturma sırasında değiştirilen belirteçler: {name}, {chords} (ilk 8 akor), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Seed'i oluştur",
    btnSeedPlay:                            "Oynat",
    btnSeedStop:                            "Durdur",
    msgSeedPlayFailed:                      "Oynatma başarısız",
    hntSeedRenderNeedsSave:                 "Çekirdeği önce bir .yams dosyasına kaydedin — ses onun yanında oluşturulur.",
    tipSeedLoad:                            "Seed yükle",
    ttlSeedLoad:                            "Seed dosyasını aç",
    lblSeedLoadFilter:                      "Seed dosyası (.yams)",
    msgSeedLoadFailed:                      "Bu seed dosyası yüklenemedi",
    tipSeedNew:                             "Yeni tohum",
    tipSeedTabClose:                        "Kapat",
    lblSeedUntitled:                        "Başlıksız",
    tipSeedSave:                            "Çekirdeği kaydet",
    tipSeedSaveAs:                          "Çekirdeği farklı kaydet…",
    ttlSeedSaveAs:                          "Çekirdeği farklı kaydet",
    msgSeedSaveFailed:                      "Çekirdek kaydedilemedi",
    msgSeedDropHere:                        "Yüklemek için bir .yams seed dosyasını buraya bırakın",
    msgSeedBusy:                            "Oluşturuluyor…",
    msgSeedEmpty:                           "Önce bir akor dizisi girin.",
    msgSeedFailed:                          "Oluşturma başarısız",
    lblSeedResult:                          "Kaydedildi",
    hntSeedResult:                          "Ses tohumunu Suno'ya (Cover) yükleyin. Yazdığınız akor adlarına değil, duyduğu harmoniye uyar.",
    msgSeedBusyInstrument:                  "Enstrüman yükleniyor…",
    msgSeedBusyRender:                      "Ses işleniyor…",
    msgSeedBusySave:                        "Kaydediliyor…",
    lblSeedSummaryChords:                   "Akorlar",
    lblSeedSummaryDuration:                 "Süre",
    lblSeedSummarySize:                     "Tahm. boyut",
    msgSeedSummaryInvalid:                  "Tanınmadı:",
    msgSeedSummarySigBad:                   "Geçersiz ölçü",

  },

  hr: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Odustani",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nova verzija dostupna:",
    lnkUpdateWhatsNew:                      "Što je novo",
    btnUpdateDownload:                      "Preuzmi",
    lnkUpdateSkip:                          "Preskoči ovu verziju",
    tipUpdateDismiss:                       "Odbaci",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Otvori postavke",
    tipHdrHelp:                             "Pomoć",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Postavke",
    tabDlgSettingsDisplay:                  "Prikaz",
    tabDlgSettingsAbout:                    "O programu",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Jezik",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Tamno",
    btnDlgSettingsDisplayThemeLight:        "Svijetlo",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Generira akordne progresije kao audio + MIDI sjemenke koje ograničavaju AI generatore glazbe poput Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akordna progresija",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Jedan takt po retku: svaki redak dobiva jednako vrijeme, a akordi ga ravnomjerno dijele (jedan akord sam u retku zauzima cijeli takt). Oznake [Section], prazni reci i | se zanemaruju. Podržani su kosi akordi (C/G), septakordi (Gmaj7) i N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Taktovi po retku",
    lblSeedSig:                             "Taktna oznaka",
    lblSeedLoops:                           "Petlje",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to hr
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to hr
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to hr
    optSeedStylePad:                        "Pad", // TODO: translate to hr
    optSeedStyleDrone:                      "Drone", // TODO: translate to hr
    optSeedStyleMarker:                     "Marker", // TODO: translate to hr
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to hr
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to hr
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to hr
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to hr
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to hr
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to hr
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to hr
    lblSeedKnobReverb:                      "reverb", // TODO: translate to hr
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to hr
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to hr
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to hr
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to hr
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to hr
    tabSeedRender:                          "Render", // TODO: translate to hr
    lblSeedKnobVolume:                      "Volume", // TODO: translate to hr
    lblSeedKnobOctave:                      "Octave", // TODO: translate to hr
    lblSeedKnobTune:                        "Tune", // TODO: translate to hr
    tipSeedMute:                            "Mute", // TODO: translate to hr
    tipSeedUnmute:                          "Unmute", // TODO: translate to hr
    lblSeedReverb:                          "Reverb", // TODO: translate to hr
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to hr
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to hr
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to hr
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to hr
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to hr
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to hr
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to hr
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to hr
    optSeedInstrumentSine:                  "Sinus: ugrađeni sintisajzer",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitrate",
    lblSeedName:                            "Naziv",
    lblSeedOutput:                          "Izlaz",
    hntSeedOutput:                          "Osnovni naziv renderiranih datoteka. Tokeni zamijenjeni pri renderiranju: {name}, {chords} (prvih 8 akorda), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderiraj sjeme",
    btnSeedPlay:                            "Reproduciraj",
    btnSeedStop:                            "Zaustavi",
    msgSeedPlayFailed:                      "Reprodukcija neuspješna",
    hntSeedRenderNeedsSave:                 "Prvo spremite seed u .yams datoteku — zvuk se renderira pored nje.",
    tipSeedLoad:                            "Učitaj seed",
    ttlSeedLoad:                            "Otvori seed datoteku",
    lblSeedLoadFilter:                      "Seed datoteka (.yams)",
    msgSeedLoadFailed:                      "Nije moguće učitati tu seed datoteku",
    tipSeedNew:                             "Novo sjeme",
    tipSeedTabClose:                        "Zatvori",
    lblSeedUntitled:                        "Bez naslova",
    tipSeedSave:                            "Spremi sjeme",
    tipSeedSaveAs:                          "Spremi sjeme kao…",
    ttlSeedSaveAs:                          "Spremi sjeme kao",
    msgSeedSaveFailed:                      "Nije moguće spremiti sjeme",
    msgSeedDropHere:                        "Povucite .yams seed datoteku za učitavanje",
    msgSeedBusy:                            "Renderiranje…",
    msgSeedEmpty:                           "Prvo unesite progresiju akorda.",
    msgSeedFailed:                          "Renderiranje neuspješno",
    lblSeedResult:                          "Spremljeno",
    hntSeedResult:                          "Učitajte audio sjeme u Suno (Cover). Slijedi harmoniju koju čuje, a ne nazive akorda koje upisujete.",
    msgSeedBusyInstrument:                  "Učitavanje instrumenta…",
    msgSeedBusyRender:                      "Renderiranje zvuka…",
    msgSeedBusySave:                        "Spremanje…",
    lblSeedSummaryChords:                   "Akordi",
    lblSeedSummaryDuration:                 "Trajanje",
    lblSeedSummarySize:                     "Proc. veličina",
    msgSeedSummaryInvalid:                  "Neprepoznato:",
    msgSeedSummarySigBad:                   "Nevažeća mjera",

  },

  el: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Ακύρωση",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Νέα έκδοση διαθέσιμη:",
    lnkUpdateWhatsNew:                      "Τι νέο υπάρχει",
    btnUpdateDownload:                      "Λήψη",
    lnkUpdateSkip:                          "Παράλειψη αυτής της έκδοσης",
    tipUpdateDismiss:                       "Απόρριψη",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Άνοιγμα ρυθμίσεων",
    tipHdrHelp:                             "Βοήθεια",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Ρυθμίσεις",
    tabDlgSettingsDisplay:                  "Οθόνη",
    tabDlgSettingsAbout:                    "Σχετικά",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Γλώσσα",
    lblDlgSettingsDisplayTheme:             "Θέμα",
    btnDlgSettingsDisplayThemeDark:         "Σκοτεινό",
    btnDlgSettingsDisplayThemeLight:        "Φωτεινό",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Δημιουργεί συγχορδιακές προόδους ως ηχητικούς + MIDI σπόρους που περιορίζουν γεννήτριες μουσικής AI όπως το Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Ακολουθία συγχορδιών",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Μία μπάρα ανά γραμμή: κάθε γραμμή λαμβάνει ίσο χρόνο, και οι συγχορδίες σε αυτήν τον μοιράζονται ομοιόμορφα (μία συγχορδία μόνη της σε μια γραμμή καταλαμβάνει ολόκληρη τη μπάρα). Οι ετικέτες [Section], οι κενές γραμμές και τα | αγνοούνται. Υποστηρίζονται συγχορδίες slash (C/G), 7ες (Gmaj7) και N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Μέτρα ανά γραμμή",
    lblSeedSig:                             "Μέτρο",
    lblSeedLoops:                           "Βρόχοι",
    lblSeedStyle:                           "Στυλ",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to el
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to el
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to el
    optSeedStylePad:                        "Pad", // TODO: translate to el
    optSeedStyleDrone:                      "Drone", // TODO: translate to el
    optSeedStyleMarker:                     "Marker", // TODO: translate to el
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to el
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to el
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to el
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to el
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to el
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to el
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to el
    lblSeedKnobReverb:                      "reverb", // TODO: translate to el
    lblSeedInstrument:                      "Όργανο",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to el
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to el
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to el
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to el
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to el
    tabSeedRender:                          "Render", // TODO: translate to el
    lblSeedKnobVolume:                      "Volume", // TODO: translate to el
    lblSeedKnobOctave:                      "Octave", // TODO: translate to el
    lblSeedKnobTune:                        "Tune", // TODO: translate to el
    tipSeedMute:                            "Mute", // TODO: translate to el
    tipSeedUnmute:                          "Unmute", // TODO: translate to el
    lblSeedReverb:                          "Reverb", // TODO: translate to el
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to el
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to el
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to el
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to el
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to el
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to el
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to el
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to el
    optSeedInstrumentSine:                  "Ημίτονο: ενσωματωμένος συνθεσάιζερ",
    lblSeedFormat:                          "Μορφή",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Όνομα",
    lblSeedOutput:                          "Έξοδος",
    hntSeedOutput:                          "Βασικό όνομα των αποδοθέντων αρχείων. Διακριτικά που αντικαθίστανται κατά την απόδοση: {name}, {chords} (τα πρώτα 8 ακόρντα), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Απόδοση seed",
    btnSeedPlay:                            "Αναπαραγωγή",
    btnSeedStop:                            "Διακοπή",
    msgSeedPlayFailed:                      "Αποτυχία αναπαραγωγής",
    hntSeedRenderNeedsSave:                 "Αποθηκεύστε το seed σε ένα αρχείο .yams πρώτα — ο ήχος αποδίδεται δίπλα του.",
    tipSeedLoad:                            "Φόρτωση seed",
    ttlSeedLoad:                            "Άνοιγμα αρχείου seed",
    lblSeedLoadFilter:                      "Αρχείο seed (.yams)",
    msgSeedLoadFailed:                      "Δεν ήταν δυνατή η φόρτωση αυτού του αρχείου seed",
    tipSeedNew:                             "Νέος σπόρος",
    tipSeedTabClose:                        "Κλείσιμο",
    lblSeedUntitled:                        "Χωρίς τίτλο",
    tipSeedSave:                            "Αποθήκευση σπόρου",
    tipSeedSaveAs:                          "Αποθήκευση σπόρου ως…",
    ttlSeedSaveAs:                          "Αποθήκευση σπόρου ως",
    msgSeedSaveFailed:                      "Δεν ήταν δυνατή η αποθήκευση του σπόρου",
    msgSeedDropHere:                        "Σύρετε ένα αρχείο .yams seed για φόρτωση",
    msgSeedBusy:                            "Αποδίδεται…",
    msgSeedEmpty:                           "Εισαγάγετε πρώτα μια ακολουθία συγχορδιών.",
    msgSeedFailed:                          "Αποτυχία απόδοσης",
    lblSeedResult:                          "Αποθηκεύτηκε",
    hntSeedResult:                          "Ανεβάστε το ηχητικό seed στο Suno (Cover). Ακολουθεί την αρμονία που ακούει, όχι τα ονόματα συγχορδιών που πληκτρολογείτε.",
    msgSeedBusyInstrument:                  "Φόρτωση οργάνου…",
    msgSeedBusyRender:                      "Απόδοση ήχου…",
    msgSeedBusySave:                        "Αποθήκευση…",
    lblSeedSummaryChords:                   "Συγχορδίες",
    lblSeedSummaryDuration:                 "Διάρκεια",
    lblSeedSummarySize:                     "Εκτ. μέγεθος",
    msgSeedSummaryInvalid:                  "Μη αναγνωρισμένο:",
    msgSeedSummarySigBad:                   "Μη έγκυρο μέτρο",

  },

  he: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "ביטול",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "גרסה חדשה זמינה:",
    lnkUpdateWhatsNew:                      "מה חדש",
    btnUpdateDownload:                      "הורדה",
    lnkUpdateSkip:                          "דלג על גרסה זו",
    tipUpdateDismiss:                       "בטל",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "פתח הגדרות",
    tipHdrHelp:                             "עזרה",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "הגדרות",
    tabDlgSettingsDisplay:                  "תצוגה",
    tabDlgSettingsAbout:                    "אודות",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "שפה",
    lblDlgSettingsDisplayTheme:             "ערכת נושא",
    btnDlgSettingsDisplayThemeDark:         "כהה",
    btnDlgSettingsDisplayThemeLight:        "בהיר",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "מפיק התקדמויות אקורדים לזרעי אודיו + MIDI המגבילים מחוללי מוזיקת AI כגון Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "מהלך אקורדים",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "תיבה אחת לשורה: כל שורה מקבלת זמן שווה, והאקורדים בה מחלקים את הזמן באופן שווה (אקורד בודד בשורה תופס את כל התיבה). תגיות [Section], שורות ריקות ו-| מתעלמים. אקורדי סלאש (C/G), ספטאקורדים (Gmaj7) ו-N.C. נתמכים.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "תיבות לשורה",
    lblSeedSig:                             "חתימת זמן",
    lblSeedLoops:                           "לולאות",
    lblSeedStyle:                           "סגנון",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to he
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to he
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to he
    optSeedStylePad:                        "Pad", // TODO: translate to he
    optSeedStyleDrone:                      "Drone", // TODO: translate to he
    optSeedStyleMarker:                     "Marker", // TODO: translate to he
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to he
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to he
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to he
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to he
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to he
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to he
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to he
    lblSeedKnobReverb:                      "reverb", // TODO: translate to he
    lblSeedInstrument:                      "כלי נגינה",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to he
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to he
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to he
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to he
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to he
    tabSeedRender:                          "Render", // TODO: translate to he
    lblSeedKnobVolume:                      "Volume", // TODO: translate to he
    lblSeedKnobOctave:                      "Octave", // TODO: translate to he
    lblSeedKnobTune:                        "Tune", // TODO: translate to he
    tipSeedMute:                            "Mute", // TODO: translate to he
    tipSeedUnmute:                          "Unmute", // TODO: translate to he
    lblSeedReverb:                          "Reverb", // TODO: translate to he
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to he
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to he
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to he
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to he
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to he
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to he
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to he
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to he
    optSeedInstrumentSine:                  "סינוס: סינתיסייזר מובנה",
    lblSeedFormat:                          "פורמט",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "ביטרייט MP3",
    lblSeedName:                            "שם",
    lblSeedOutput:                          "פלט",
    hntSeedOutput:                          "שם בסיס של הקבצים המעובדים. אסימונים מוחלפים בעת העיבוד: {name}, {chords} (8 האקורדים הראשונים), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "רנדר סיד",
    btnSeedPlay:                            "נגן",
    btnSeedStop:                            "עצור",
    msgSeedPlayFailed:                      "ההפעלה נכשלה",
    hntSeedRenderNeedsSave:                 "שמור את ה-seed לקובץ .yams תחילה — האודיו מעובד לידו.",
    tipSeedLoad:                            "טען Seed",
    ttlSeedLoad:                            "פתח קובץ Seed",
    lblSeedLoadFilter:                      "קובץ Seed (.yams)",
    msgSeedLoadFailed:                      "לא ניתן היה לטעון את קובץ ה-Seed הזה",
    tipSeedNew:                             "זרע חדש",
    tipSeedTabClose:                        "סגור",
    lblSeedUntitled:                        "ללא כותרת",
    tipSeedSave:                            "שמור סיד",
    tipSeedSaveAs:                          "שמור סיד בשם…",
    ttlSeedSaveAs:                          "שמור סיד בשם",
    msgSeedSaveFailed:                      "לא ניתן היה לשמור את הסיד",
    msgSeedDropHere:                        "גרור קובץ seed מסוג .yams כדי לטעון אותו",
    msgSeedBusy:                            "מעבד…",
    msgSeedEmpty:                           "הזן תחילה מהלך אקורדים.",
    msgSeedFailed:                          "עיבוד נכשל",
    lblSeedResult:                          "נשמר",
    hntSeedResult:                          "העלה את גרעין האודיו ל-Suno (קאבר). הוא עוקב אחר ההרמוניה שהוא שומע, לא אחר שמות האקורדים שאתה מקליד.",
    msgSeedBusyInstrument:                  "טוען כלי נגינה…",
    msgSeedBusyRender:                      "רינדור שמע…",
    msgSeedBusySave:                        "שומר…",
    lblSeedSummaryChords:                   "אקורדים",
    lblSeedSummaryDuration:                 "משך",
    lblSeedSummarySize:                     "גודל משוער",
    msgSeedSummaryInvalid:                  "לא מזוהה:",
    msgSeedSummarySigBad:                   "משקל לא חוקי",

  },

  ar: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "إلغاء",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "إصدار جديد متوفر:",
    lnkUpdateWhatsNew:                      "ما الجديد",
    btnUpdateDownload:                      "تنزيل",
    lnkUpdateSkip:                          "تخطي هذا الإصدار",
    tipUpdateDismiss:                       "تجاهل",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "فتح الإعدادات",
    tipHdrHelp:                             "مساعدة",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "الإعدادات",
    tabDlgSettingsDisplay:                  "عرض",
    tabDlgSettingsAbout:                    "حول",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "اللغة",
    lblDlgSettingsDisplayTheme:             "المظهر",
    btnDlgSettingsDisplayThemeDark:         "داكن",
    btnDlgSettingsDisplayThemeLight:        "فاتح",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "يحول تتابعات الأوتار إلى بذور صوتية وMIDI تقيد مولدات الموسيقى بالذكاء الاصطناعي مثل Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "تتابع الكوردات",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "مقياس واحد لكل سطر: كل سطر يحصل على وقت متساوٍ، وتقسّم الأوتار عليه هذا الوقت بالتساوي (وتر واحد في سطر يحتل المقياس بأكمله). يتم تجاهل علامات [Section] والأسطر الفارغة وعلامات |. يتم دعم الأوتار المائلة (C/G) والسابعية (Gmaj7) وN.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "موازير لكل سطر",
    lblSeedSig:                             "توقيع زمني",
    lblSeedLoops:                           "حلقات",
    lblSeedStyle:                           "نمط",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ar
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ar
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ar
    optSeedStylePad:                        "Pad", // TODO: translate to ar
    optSeedStyleDrone:                      "Drone", // TODO: translate to ar
    optSeedStyleMarker:                     "Marker", // TODO: translate to ar
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ar
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ar
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ar
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ar
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ar
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ar
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ar
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ar
    lblSeedInstrument:                      "آلة موسيقية",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ar
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ar
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ar
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ar
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ar
    tabSeedRender:                          "Render", // TODO: translate to ar
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ar
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ar
    lblSeedKnobTune:                        "Tune", // TODO: translate to ar
    tipSeedMute:                            "Mute", // TODO: translate to ar
    tipSeedUnmute:                          "Unmute", // TODO: translate to ar
    lblSeedReverb:                          "Reverb", // TODO: translate to ar
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ar
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ar
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ar
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ar
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ar
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ar
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ar
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ar
    optSeedInstrumentSine:                  "جيب: مركب صوتي مدمج",
    lblSeedFormat:                          "تنسيق",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "معدل بت MP3",
    lblSeedName:                            "الاسم",
    lblSeedOutput:                          "الإخراج",
    hntSeedOutput:                          "الاسم الأساسي للملفات المعروضة. الرموز المميزة المستبدلة عند العرض: {name}, {chords} (أول 8 أوتار), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "عرض البذرة",
    btnSeedPlay:                            "تشغيل",
    btnSeedStop:                            "إيقاف",
    msgSeedPlayFailed:                      "فشل التشغيل",
    hntSeedRenderNeedsSave:                 "احفظ البذرة في ملف .yams أولاً — يتم عرض الصوت بجانبه.",
    tipSeedLoad:                            "تحميل البذرة",
    ttlSeedLoad:                            "فتح ملف بذرة",
    lblSeedLoadFilter:                      "ملف بذرة (.yams)",
    msgSeedLoadFailed:                      "تعذر تحميل ملف البذرة هذا",
    tipSeedNew:                             "بذرة جديدة",
    tipSeedTabClose:                        "إغلاق",
    lblSeedUntitled:                        "بدون عنوان",
    tipSeedSave:                            "حفظ البذرة",
    tipSeedSaveAs:                          "حفظ البذرة باسم…",
    ttlSeedSaveAs:                          "حفظ البذرة باسم",
    msgSeedSaveFailed:                      "تعذر حفظ البذرة",
    msgSeedDropHere:                        "اسحب ملف بذرة .yams لتحميله",
    msgSeedBusy:                            "جارٍ التقديم…",
    msgSeedEmpty:                           "أدخل تسلسلًا وتريًا أولاً.",
    msgSeedFailed:                          "فشل التقديم",
    lblSeedResult:                          "تم الحفظ",
    hntSeedResult:                          "ارفع بذرة الصوت إلى Suno (غلاف). يتبع الانسجام الذي يسمعه، وليس أسماء الأوتار التي تكتبها.",
    msgSeedBusyInstrument:                  "جارٍ تحميل الآلة الموسيقية…",
    msgSeedBusyRender:                      "جاري معالجة الصوت…",
    msgSeedBusySave:                        "جاري الحفظ…",
    lblSeedSummaryChords:                   "كوردات",
    lblSeedSummaryDuration:                 "المدة",
    lblSeedSummarySize:                     "الحجم المقدر",
    msgSeedSummaryInvalid:                  "غير معروف:",
    msgSeedSummarySigBad:                   "ميزان غير صالح",

  },

  fa: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "لغو",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "نسخه جدید موجود است:",
    lnkUpdateWhatsNew:                      "چه خبر",
    btnUpdateDownload:                      "دانلود",
    lnkUpdateSkip:                          "رد کردن این نسخه",
    tipUpdateDismiss:                       "رد کردن",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "باز کردن تنظیمات",
    tipHdrHelp:                             "راهنما",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "تنظیمات",
    tabDlgSettingsDisplay:                  "نمایش",
    tabDlgSettingsAbout:                    "درباره",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "زبان",
    lblDlgSettingsDisplayTheme:             "پوسته",
    btnDlgSettingsDisplayThemeDark:         "تیره",
    btnDlgSettingsDisplayThemeLight:        "روشن",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "تبدیل توالی آکوردها به بذرهای صوتی و MIDI که ژنراتورهای موسیقی هوش مصنوعی مانند Suno را محدود می‌کنند.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "توالی آکورد",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "یک میزان در هر خط: هر خط زمان مساوی می‌گیرد و آکوردها آن زمان را به طور مساوی تقسیم می‌کنند (یک آکورد تنها در یک خط کل میزان را اشغال می‌کند). تگ‌های [Section]، خطوط خالی و علامت | نادیده گرفته می‌شوند. آکوردهای اسلش (C/G)، هفتم (Gmaj7) و N.C. پشتیبانی می‌شوند.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "میزان در هر خط",
    lblSeedSig:                             "میزان نما",
    lblSeedLoops:                           "حلقه‌ها",
    lblSeedStyle:                           "سبک",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to fa
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to fa
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to fa
    optSeedStylePad:                        "Pad", // TODO: translate to fa
    optSeedStyleDrone:                      "Drone", // TODO: translate to fa
    optSeedStyleMarker:                     "Marker", // TODO: translate to fa
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to fa
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to fa
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to fa
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to fa
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to fa
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to fa
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to fa
    lblSeedKnobReverb:                      "reverb", // TODO: translate to fa
    lblSeedInstrument:                      "ساز",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to fa
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to fa
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to fa
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to fa
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to fa
    tabSeedRender:                          "Render", // TODO: translate to fa
    lblSeedKnobVolume:                      "Volume", // TODO: translate to fa
    lblSeedKnobOctave:                      "Octave", // TODO: translate to fa
    lblSeedKnobTune:                        "Tune", // TODO: translate to fa
    tipSeedMute:                            "Mute", // TODO: translate to fa
    tipSeedUnmute:                          "Unmute", // TODO: translate to fa
    lblSeedReverb:                          "Reverb", // TODO: translate to fa
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to fa
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to fa
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to fa
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to fa
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to fa
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to fa
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to fa
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to fa
    optSeedInstrumentSine:                  "سینوسی: سینت سایزر داخلی",
    lblSeedFormat:                          "قالب",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "بیت‌ریت MP3",
    lblSeedName:                            "نام",
    lblSeedOutput:                          "خروجی",
    hntSeedOutput:                          "نام پایه فایل‌های رندر شده. توکن‌های جایگزین شده هنگام رندر: {name}, {chords} (۸ آکورد اول), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "رندر سید",
    btnSeedPlay:                            "پخش",
    btnSeedStop:                            "توقف",
    msgSeedPlayFailed:                      "پخش ناموفق بود",
    hntSeedRenderNeedsSave:                 "ابتدا seed را در یک فایل .yams ذخیره کنید — صدا در کنار آن رندر می‌شود.",
    tipSeedLoad:                            "بارگذاری سید",
    ttlSeedLoad:                            "باز کردن فایل سید",
    lblSeedLoadFilter:                      "فایل سید (.yams)",
    msgSeedLoadFailed:                      "امکان بارگذاری این فایل سید وجود نداشت",
    tipSeedNew:                             "دانه جدید",
    tipSeedTabClose:                        "بستن",
    lblSeedUntitled:                        "بدون عنوان",
    tipSeedSave:                            "ذخیره سید",
    tipSeedSaveAs:                          "ذخیره سید با نام…",
    ttlSeedSaveAs:                          "ذخیره سید با نام",
    msgSeedSaveFailed:                      "ذخیره سید انجام نشد",
    msgSeedDropHere:                        "فایل seed با پسوند .yams را برای بارگذاری رها کنید",
    msgSeedBusy:                            "در حال رندر…",
    msgSeedEmpty:                           "ابتدا یک توالی آکورد وارد کنید.",
    msgSeedFailed:                          "رندر ناموفق",
    lblSeedResult:                          "ذخیره شد",
    hntSeedResult:                          "بذر صوتی را در Suno (کاور) بارگذاری کنید. این برنامه از هارمونی که می‌شنود پیروی می‌کند، نه نام آکوردهایی که تایپ می‌کنید.",
    msgSeedBusyInstrument:                  "در حال بارگذاری ساز…",
    msgSeedBusyRender:                      "در حال رندر صدا…",
    msgSeedBusySave:                        "در حال ذخیره…",
    lblSeedSummaryChords:                   "آکوردها",
    lblSeedSummaryDuration:                 "مدت زمان",
    lblSeedSummarySize:                     "اندازه تخمینی",
    msgSeedSummaryInvalid:                  "ناشناخته:",
    msgSeedSummarySigBad:                   "میزان‌نما نامعتبر",

  },

  zh_CN: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "取消",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "新版本可用:",
    lnkUpdateWhatsNew:                      "新功能",
    btnUpdateDownload:                      "下载",
    lnkUpdateSkip:                          "跳过此版本",
    tipUpdateDismiss:                       "忽略",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "打开设置",
    tipHdrHelp:                             "帮助",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "设置",
    tabDlgSettingsDisplay:                  "显示",
    tabDlgSettingsAbout:                    "关于",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "语言",
    lblDlgSettingsDisplayTheme:             "主题",
    btnDlgSettingsDisplayThemeDark:         "深色",
    btnDlgSettingsDisplayThemeLight:        "浅色",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "将和弦进行渲染为音频和 MIDI 种子，用于约束 Suno 等 AI 音乐生成器。",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "和弦进行",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "每行一小节：每行获得相同时间，其上的和弦平均分配该时间（一行上只有一个和弦时，它占据整个小节）。[Section] 标签、空行和 | 标记将被忽略。支持斜线和弦 (C/G)、七和弦 (Gmaj7) 和 N.C.。",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "每行小节数",
    lblSeedSig:                             "拍号",
    lblSeedLoops:                           "循环",
    lblSeedStyle:                           "风格",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to zh_CN
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to zh_CN
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to zh_CN
    optSeedStylePad:                        "Pad", // TODO: translate to zh_CN
    optSeedStyleDrone:                      "Drone", // TODO: translate to zh_CN
    optSeedStyleMarker:                     "Marker", // TODO: translate to zh_CN
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to zh_CN
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to zh_CN
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to zh_CN
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to zh_CN
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to zh_CN
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to zh_CN
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to zh_CN
    lblSeedKnobReverb:                      "reverb", // TODO: translate to zh_CN
    lblSeedInstrument:                      "乐器",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to zh_CN
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to zh_CN
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to zh_CN
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to zh_CN
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to zh_CN
    tabSeedRender:                          "Render", // TODO: translate to zh_CN
    lblSeedKnobVolume:                      "Volume", // TODO: translate to zh_CN
    lblSeedKnobOctave:                      "Octave", // TODO: translate to zh_CN
    lblSeedKnobTune:                        "Tune", // TODO: translate to zh_CN
    tipSeedMute:                            "Mute", // TODO: translate to zh_CN
    tipSeedUnmute:                          "Unmute", // TODO: translate to zh_CN
    lblSeedReverb:                          "Reverb", // TODO: translate to zh_CN
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to zh_CN
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to zh_CN
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to zh_CN
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to zh_CN
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to zh_CN
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to zh_CN
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to zh_CN
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to zh_CN
    optSeedInstrumentSine:                  "正弦：内置合成器",
    lblSeedFormat:                          "格式",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 比特率",
    lblSeedName:                            "名称",
    lblSeedOutput:                          "输出",
    hntSeedOutput:                          "渲染文件的基本名称。渲染时替换的令牌：{name}, {chords} (前8个和弦), {style}, {instrument}, {bpm}, {loops}。",
    btnSeedRender:                          "渲染种子",
    btnSeedPlay:                            "播放",
    btnSeedStop:                            "停止",
    msgSeedPlayFailed:                      "播放失败",
    hntSeedRenderNeedsSave:                 "请先将种子保存到 .yams 文件 — 音频将渲染到该文件旁边。",
    tipSeedLoad:                            "加载种子",
    ttlSeedLoad:                            "打开种子文件",
    lblSeedLoadFilter:                      "种子文件 (.yams)",
    msgSeedLoadFailed:                      "无法加载该种子文件",
    tipSeedNew:                             "新种子",
    tipSeedTabClose:                        "关闭",
    lblSeedUntitled:                        "未命名",
    tipSeedSave:                            "保存种子",
    tipSeedSaveAs:                          "将种子另存为…",
    ttlSeedSaveAs:                          "将种子另存为",
    msgSeedSaveFailed:                      "无法保存种子",
    msgSeedDropHere:                        "拖放 .yams 种子文件以加载",
    msgSeedBusy:                            "正在渲染…",
    msgSeedEmpty:                           "请先输入和弦进行。",
    msgSeedFailed:                          "渲染失败",
    lblSeedResult:                          "已保存",
    hntSeedResult:                          "将音频种子上传到 Suno (翻唱)。它遵循听到的和声，而非您输入的和弦名称。",
    msgSeedBusyInstrument:                  "正在加载乐器…",
    msgSeedBusyRender:                      "正在渲染音频…",
    msgSeedBusySave:                        "正在保存…",
    lblSeedSummaryChords:                   "和弦",
    lblSeedSummaryDuration:                 "时长",
    lblSeedSummarySize:                     "预估大小",
    msgSeedSummaryInvalid:                  "无法识别:",
    msgSeedSummarySigBad:                   "无效拍号",

  },

  zh_TW: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "取消",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "新版本可用:",
    lnkUpdateWhatsNew:                      "新功能",
    btnUpdateDownload:                      "下載",
    lnkUpdateSkip:                          "跳過此版本",
    tipUpdateDismiss:                       "忽略",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "打開設定",
    tipHdrHelp:                             "說明",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "設定",
    tabDlgSettingsDisplay:                  "顯示",
    tabDlgSettingsAbout:                    "關於",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "語言",
    lblDlgSettingsDisplayTheme:             "佈景主題",
    btnDlgSettingsDisplayThemeDark:         "深色",
    btnDlgSettingsDisplayThemeLight:        "淺色",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "將和弦進行渲染為音訊和 MIDI 種子，用於約束 Suno 等 AI 音樂生成器。",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "和弦進行",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "每行一小節：每行獲得相同時間，其上的和弦平均分配該時間（一行上只有一個和弦時，它佔據整個小節）。[Section] 標籤、空行和 | 標記將被忽略。支援斜線和弦 (C/G)、七和弦 (Gmaj7) 和 N.C.。",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "每行小節數",
    lblSeedSig:                             "拍號",
    lblSeedLoops:                           "循環",
    lblSeedStyle:                           "風格",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to zh_TW
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to zh_TW
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to zh_TW
    optSeedStylePad:                        "Pad", // TODO: translate to zh_TW
    optSeedStyleDrone:                      "Drone", // TODO: translate to zh_TW
    optSeedStyleMarker:                     "Marker", // TODO: translate to zh_TW
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to zh_TW
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to zh_TW
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to zh_TW
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to zh_TW
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to zh_TW
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to zh_TW
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to zh_TW
    lblSeedKnobReverb:                      "reverb", // TODO: translate to zh_TW
    lblSeedInstrument:                      "樂器",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to zh_TW
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to zh_TW
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to zh_TW
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to zh_TW
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to zh_TW
    tabSeedRender:                          "Render", // TODO: translate to zh_TW
    lblSeedKnobVolume:                      "Volume", // TODO: translate to zh_TW
    lblSeedKnobOctave:                      "Octave", // TODO: translate to zh_TW
    lblSeedKnobTune:                        "Tune", // TODO: translate to zh_TW
    tipSeedMute:                            "Mute", // TODO: translate to zh_TW
    tipSeedUnmute:                          "Unmute", // TODO: translate to zh_TW
    lblSeedReverb:                          "Reverb", // TODO: translate to zh_TW
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to zh_TW
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to zh_TW
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to zh_TW
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to zh_TW
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to zh_TW
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to zh_TW
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to zh_TW
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to zh_TW
    optSeedInstrumentSine:                  "正弦：內建合成器",
    lblSeedFormat:                          "格式",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 位元率",
    lblSeedName:                            "名稱",
    lblSeedOutput:                          "輸出",
    hntSeedOutput:                          "渲染檔案的基本名稱。渲染時替換的令牌：{name}, {chords} (前8個和弦), {style}, {instrument}, {bpm}, {loops}。",
    btnSeedRender:                          "渲染種子",
    btnSeedPlay:                            "播放",
    btnSeedStop:                            "停止",
    msgSeedPlayFailed:                      "播放失敗",
    hntSeedRenderNeedsSave:                 "請先將種子儲存至 .yams 檔案 — 音訊將會渲染於其旁。",
    tipSeedLoad:                            "載入種子",
    ttlSeedLoad:                            "開啟種子檔案",
    lblSeedLoadFilter:                      "種子檔案 (.yams)",
    msgSeedLoadFailed:                      "無法載入該種子檔案",
    tipSeedNew:                             "新種子",
    tipSeedTabClose:                        "關閉",
    lblSeedUntitled:                        "未命名",
    tipSeedSave:                            "儲存種子",
    tipSeedSaveAs:                          "將種子另存為…",
    ttlSeedSaveAs:                          "將種子另存為",
    msgSeedSaveFailed:                      "無法儲存種子",
    msgSeedDropHere:                        "拖放 .yams 種子檔案以載入",
    msgSeedBusy:                            "正在渲染…",
    msgSeedEmpty:                           "請先輸入和弦進行。",
    msgSeedFailed:                          "渲染失敗",
    lblSeedResult:                          "已儲存",
    hntSeedResult:                          "將音訊種子上傳至 Suno (翻唱)。它遵循聽到的和聲，而非您輸入的和弦名稱。",
    msgSeedBusyInstrument:                  "正在載入樂器…",
    msgSeedBusyRender:                      "正在渲染音訊…",
    msgSeedBusySave:                        "正在儲存…",
    lblSeedSummaryChords:                   "和弦",
    lblSeedSummaryDuration:                 "時長",
    lblSeedSummarySize:                     "預估大小",
    msgSeedSummaryInvalid:                  "無法辨識:",
    msgSeedSummarySigBad:                   "無效拍號",

  },

  ja: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "キャンセル",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "新しいバージョンが利用可能です:",
    lnkUpdateWhatsNew:                      "新機能",
    btnUpdateDownload:                      "ダウンロード",
    lnkUpdateSkip:                          "このバージョンをスキップ",
    tipUpdateDismiss:                       "閉じる",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "設定を開く",
    tipHdrHelp:                             "ヘルプ",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "設定",
    tabDlgSettingsDisplay:                  "表示",
    tabDlgSettingsAbout:                    "概要",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "言語",
    lblDlgSettingsDisplayTheme:             "テーマ",
    btnDlgSettingsDisplayThemeDark:         "ダーク",
    btnDlgSettingsDisplayThemeLight:        "ライト",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "コード進行をオーディオとMIDIシードとして生成し、SunoのようなAI音楽ジェネレーターを制約します。",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "コード進行",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "1行1小節: 各行は均等な時間を受け取り、その上のコードはその時間を均等に分割します（1行にコードが1つだけの場合、そのコードが小節全体を占めます）。[Section]タグ、空白行、|マークは無視されます。スラッシュコード (C/G)、7th (Gmaj7)、N.C.に対応しています。",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "1行あたりの小節数",
    lblSeedSig:                             "拍子記号",
    lblSeedLoops:                           "ループ",
    lblSeedStyle:                           "スタイル",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ja
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ja
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ja
    optSeedStylePad:                        "Pad", // TODO: translate to ja
    optSeedStyleDrone:                      "Drone", // TODO: translate to ja
    optSeedStyleMarker:                     "Marker", // TODO: translate to ja
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ja
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ja
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ja
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ja
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ja
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ja
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ja
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ja
    lblSeedInstrument:                      "楽器",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ja
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ja
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ja
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ja
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ja
    tabSeedRender:                          "Render", // TODO: translate to ja
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ja
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ja
    lblSeedKnobTune:                        "Tune", // TODO: translate to ja
    tipSeedMute:                            "Mute", // TODO: translate to ja
    tipSeedUnmute:                          "Unmute", // TODO: translate to ja
    lblSeedReverb:                          "Reverb", // TODO: translate to ja
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ja
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ja
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ja
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ja
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ja
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ja
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ja
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ja
    optSeedInstrumentSine:                  "サイン波：内蔵シンセ",
    lblSeedFormat:                          "フォーマット",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 ビットレート",
    lblSeedName:                            "名前",
    lblSeedOutput:                          "出力",
    hntSeedOutput:                          "レンダリングされたファイルのベース名。レンダリング時に置き換えられるトークン：{name}, {chords} (最初の8つのコード), {style}, {instrument}, {bpm}, {loops}。",
    btnSeedRender:                          "シードをレンダリング",
    btnSeedPlay:                            "再生",
    btnSeedStop:                            "停止",
    msgSeedPlayFailed:                      "再生に失敗しました",
    hntSeedRenderNeedsSave:                 "まずシードを.yamsファイルに保存してください — 音声はその隣にレンダリングされます。",
    tipSeedLoad:                            "シードを読み込む",
    ttlSeedLoad:                            "シードファイルを開く",
    lblSeedLoadFilter:                      "シードファイル (.yams)",
    msgSeedLoadFailed:                      "このシードファイルを読み込めませんでした",
    tipSeedNew:                             "新しいシード",
    tipSeedTabClose:                        "閉じる",
    lblSeedUntitled:                        "無題",
    tipSeedSave:                            "シードを保存",
    tipSeedSaveAs:                          "シードを名前を付けて保存…",
    ttlSeedSaveAs:                          "シードを名前を付けて保存",
    msgSeedSaveFailed:                      "シードを保存できませんでした",
    msgSeedDropHere:                        ".yams シードファイルをドロップして読み込みます",
    msgSeedBusy:                            "レンダリング中…",
    msgSeedEmpty:                           "まずコード進行を入力してください。",
    msgSeedFailed:                          "レンダリング失敗",
    lblSeedResult:                          "保存済み",
    hntSeedResult:                          "オーディオシードをSuno (カバー) にアップロードします。入力したコード名ではなく、聞こえるハーモニーに従います。",
    msgSeedBusyInstrument:                  "楽器を読み込み中…",
    msgSeedBusyRender:                      "音声レンダリング中…",
    msgSeedBusySave:                        "保存中…",
    lblSeedSummaryChords:                   "コード",
    lblSeedSummaryDuration:                 "期間",
    lblSeedSummarySize:                     "推定サイズ",
    msgSeedSummaryInvalid:                  "未認識:",
    msgSeedSummarySigBad:                   "無効な拍子記号",

  },

  ko: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "취소",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "새 버전 사용 가능:",
    lnkUpdateWhatsNew:                      "새로운 기능",
    btnUpdateDownload:                      "다운로드",
    lnkUpdateSkip:                          "이 버전 건너뛰기",
    tipUpdateDismiss:                       "닫기",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "설정 열기",
    tipHdrHelp:                             "도움말",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "설정",
    tabDlgSettingsDisplay:                  "디스플레이",
    tabDlgSettingsAbout:                    "정보",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "언어",
    lblDlgSettingsDisplayTheme:             "테마",
    btnDlgSettingsDisplayThemeDark:         "어둡게",
    btnDlgSettingsDisplayThemeLight:        "밝게",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "코드 진행을 Suno와 같은 AI 음악 생성기를 제약하는 오디오 및 MIDI 시드로 생성합니다.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "코드 진행",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "한 줄에 한 마디: 각 줄은 동일한 시간을 가지며, 그 위의 코드는 시간을 균등하게 나눕니다 (한 줄에 코드 하나만 있으면 전체 마디를 차지합니다). [Section] 태그, 빈 줄 및 | 표시는 무시됩니다. 슬래시 코드 (C/G), 7th (Gmaj7) 및 N.C.가 지원됩니다.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "줄당 마디 수",
    lblSeedSig:                             "박자표",
    lblSeedLoops:                           "루프",
    lblSeedStyle:                           "스타일",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ko
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ko
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ko
    optSeedStylePad:                        "Pad", // TODO: translate to ko
    optSeedStyleDrone:                      "Drone", // TODO: translate to ko
    optSeedStyleMarker:                     "Marker", // TODO: translate to ko
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ko
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ko
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ko
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ko
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ko
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ko
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ko
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ko
    lblSeedInstrument:                      "악기",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ko
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ko
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ko
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ko
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ko
    tabSeedRender:                          "Render", // TODO: translate to ko
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ko
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ko
    lblSeedKnobTune:                        "Tune", // TODO: translate to ko
    tipSeedMute:                            "Mute", // TODO: translate to ko
    tipSeedUnmute:                          "Unmute", // TODO: translate to ko
    lblSeedReverb:                          "Reverb", // TODO: translate to ko
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ko
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ko
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ko
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ko
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ko
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ko
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ko
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ko
    optSeedInstrumentSine:                  "사인: 내장 신시사이저",
    lblSeedFormat:                          "형식",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 비트 전송률",
    lblSeedName:                            "이름",
    lblSeedOutput:                          "출력",
    hntSeedOutput:                          "렌더링된 파일의 기본 이름. 렌더링 시 대체되는 토큰: {name}, {chords} (첫 8개 코드), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "시드 렌더링",
    btnSeedPlay:                            "재생",
    btnSeedStop:                            "중지",
    msgSeedPlayFailed:                      "재생 실패",
    hntSeedRenderNeedsSave:                 "먼저 시드를 .yams 파일에 저장하세요 — 오디오는 그 옆에 렌더링됩니다.",
    tipSeedLoad:                            "시드 불러오기",
    ttlSeedLoad:                            "시드 파일 열기",
    lblSeedLoadFilter:                      "시드 파일 (.yams)",
    msgSeedLoadFailed:                      "해당 시드 파일을 로드할 수 없습니다",
    tipSeedNew:                             "새 시드",
    tipSeedTabClose:                        "닫기",
    lblSeedUntitled:                        "제목 없음",
    tipSeedSave:                            "시드 저장",
    tipSeedSaveAs:                          "다른 이름으로 시드 저장…",
    ttlSeedSaveAs:                          "다른 이름으로 시드 저장",
    msgSeedSaveFailed:                      "시드를 저장할 수 없습니다",
    msgSeedDropHere:                        ".yams 시드 파일을 여기에 놓아 로드하세요",
    msgSeedBusy:                            "렌더링 중…",
    msgSeedEmpty:                           "먼저 코드 진행을 입력하세요.",
    msgSeedFailed:                          "렌더링 실패",
    lblSeedResult:                          "저장됨",
    hntSeedResult:                          "오디오 시드를 Suno (커버)에 업로드하세요. 입력한 코드 이름이 아닌, 들리는 하모니를 따릅니다.",
    msgSeedBusyInstrument:                  "악기 로드 중…",
    msgSeedBusyRender:                      "오디오 렌더링 중…",
    msgSeedBusySave:                        "저장 중…",
    lblSeedSummaryChords:                   "코드",
    lblSeedSummaryDuration:                 "길이",
    lblSeedSummarySize:                     "예상 크기",
    msgSeedSummaryInvalid:                  "인식할 수 없음:",
    msgSeedSummarySigBad:                   "잘못된 박자표",

  },

  vi: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Hủy",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Phiên bản mới có sẵn:",
    lnkUpdateWhatsNew:                      "Có gì mới",
    btnUpdateDownload:                      "Tải xuống",
    lnkUpdateSkip:                          "Bỏ qua phiên bản này",
    tipUpdateDismiss:                       "Bỏ qua",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Mở cài đặt",
    tipHdrHelp:                             "Trợ giúp",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Cài đặt",
    tabDlgSettingsDisplay:                  "Hiển thị",
    tabDlgSettingsAbout:                    "Giới thiệu",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Ngôn ngữ",
    lblDlgSettingsDisplayTheme:             "Chủ đề",
    btnDlgSettingsDisplayThemeDark:         "Tối",
    btnDlgSettingsDisplayThemeLight:        "Sáng",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Tạo ra các chuỗi hợp âm thành hạt giống âm thanh + MIDI để hạn chế các trình tạo nhạc AI như Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Tiến trình hợp âm",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Một ô nhịp mỗi dòng: mỗi dòng có thời gian bằng nhau, và các hợp âm trên đó chia đều thời gian đó (một hợp âm duy nhất trên một dòng chiếm toàn bộ ô nhịp). Các thẻ [Section], dòng trống và dấu | bị bỏ qua. Hỗ trợ hợp âm slash (C/G), 7ths (Gmaj7) và N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Số ô nhịp mỗi dòng",
    lblSeedSig:                             "Nhịp",
    lblSeedLoops:                           "Vòng lặp",
    lblSeedStyle:                           "Kiểu",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to vi
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to vi
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to vi
    optSeedStylePad:                        "Pad", // TODO: translate to vi
    optSeedStyleDrone:                      "Drone", // TODO: translate to vi
    optSeedStyleMarker:                     "Marker", // TODO: translate to vi
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to vi
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to vi
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to vi
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to vi
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to vi
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to vi
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to vi
    lblSeedKnobReverb:                      "reverb", // TODO: translate to vi
    lblSeedInstrument:                      "Nhạc cụ",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to vi
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to vi
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to vi
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to vi
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to vi
    tabSeedRender:                          "Render", // TODO: translate to vi
    lblSeedKnobVolume:                      "Volume", // TODO: translate to vi
    lblSeedKnobOctave:                      "Octave", // TODO: translate to vi
    lblSeedKnobTune:                        "Tune", // TODO: translate to vi
    tipSeedMute:                            "Mute", // TODO: translate to vi
    tipSeedUnmute:                          "Unmute", // TODO: translate to vi
    lblSeedReverb:                          "Reverb", // TODO: translate to vi
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to vi
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to vi
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to vi
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to vi
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to vi
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to vi
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to vi
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to vi
    optSeedInstrumentSine:                  "Sóng sin: bộ tổng hợp tích hợp",
    lblSeedFormat:                          "Định dạng",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Tốc độ bit MP3",
    lblSeedName:                            "Tên",
    lblSeedOutput:                          "Đầu ra",
    hntSeedOutput:                          "Tên cơ sở của các tệp đã kết xuất. Các mã thông báo được thay thế khi kết xuất: {name}, {chords} (8 hợp âm đầu tiên), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Kết xuất hạt giống",
    btnSeedPlay:                            "Phát",
    btnSeedStop:                            "Dừng",
    msgSeedPlayFailed:                      "Phát lại thất bại",
    hntSeedRenderNeedsSave:                 "Trước tiên, hãy lưu seed vào tệp .yams — âm thanh được kết xuất bên cạnh nó.",
    tipSeedLoad:                            "Tải seed",
    ttlSeedLoad:                            "Mở tệp seed",
    lblSeedLoadFilter:                      "Tệp seed (.yams)",
    msgSeedLoadFailed:                      "Không thể tải tệp seed đó",
    tipSeedNew:                             "Hạt giống mới",
    tipSeedTabClose:                        "Đóng",
    lblSeedUntitled:                        "Không có tiêu đề",
    tipSeedSave:                            "Lưu seed",
    tipSeedSaveAs:                          "Lưu seed thành…",
    ttlSeedSaveAs:                          "Lưu seed thành",
    msgSeedSaveFailed:                      "Không thể lưu seed",
    msgSeedDropHere:                        "Kéo thả tệp tin .yams seed để tải",
    msgSeedBusy:                            "Đang kết xuất…",
    msgSeedEmpty:                           "Vui lòng nhập chuỗi hợp âm trước.",
    msgSeedFailed:                          "Kết xuất thất bại",
    lblSeedResult:                          "Đã lưu",
    hntSeedResult:                          "Tải hạt giống âm thanh lên Suno (Cover). Nó tuân theo hòa âm mà nó nghe được, không phải tên hợp âm bạn gõ.",
    msgSeedBusyInstrument:                  "Đang tải nhạc cụ…",
    msgSeedBusyRender:                      "Đang kết xuất âm thanh…",
    msgSeedBusySave:                        "Đang lưu…",
    lblSeedSummaryChords:                   "Hợp âm",
    lblSeedSummaryDuration:                 "Thời lượng",
    lblSeedSummarySize:                     "Kích thước ước tính",
    msgSeedSummaryInvalid:                  "Không nhận dạng được:",
    msgSeedSummarySigBad:                   "Nhịp không hợp lệ",

  },

  th: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "ยกเลิก",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "มีเวอร์ชันใหม่:",
    lnkUpdateWhatsNew:                      "มีอะไรใหม่",
    btnUpdateDownload:                      "ดาวน์โหลด",
    lnkUpdateSkip:                          "ข้ามเวอร์ชันนี้",
    tipUpdateDismiss:                       "ปิด",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "เปิดการตั้งค่า",
    tipHdrHelp:                             "วิธีใช้",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "การตั้งค่า",
    tabDlgSettingsDisplay:                  "การแสดงผล",
    tabDlgSettingsAbout:                    "เกี่ยวกับ",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "ภาษา",
    lblDlgSettingsDisplayTheme:             "ธีม",
    btnDlgSettingsDisplayThemeDark:         "มืด",
    btnDlgSettingsDisplayThemeLight:        "สว่าง",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "สร้างคอร์ดโปรเกรสชันเป็นเมล็ดเสียง + MIDI ที่จำกัดเครื่องสร้างเพลง AI เช่น Suno",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "คอร์ดโปรเกรสชัน",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "หนึ่งห้องต่อหนึ่งบรรทัด: แต่ละบรรทัดจะได้รับเวลาเท่ากัน และคอร์ดบนบรรทัดนั้นจะแบ่งเวลาเท่าๆ กัน (คอร์ดเดียวบนบรรทัดจะครอบคลุมทั้งห้อง). แท็ก [Section], บรรทัดว่าง และเครื่องหมาย | จะถูกละเว้น. รองรับคอร์ดสแลช (C/G), คอร์ด 7 (Gmaj7) และ N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "ห้องเพลงต่อบรรทัด",
    lblSeedSig:                             "เครื่องหมายกำหนดจังหวะ",
    lblSeedLoops:                           "ลูป",
    lblSeedStyle:                           "สไตล์",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to th
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to th
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to th
    optSeedStylePad:                        "Pad", // TODO: translate to th
    optSeedStyleDrone:                      "Drone", // TODO: translate to th
    optSeedStyleMarker:                     "Marker", // TODO: translate to th
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to th
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to th
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to th
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to th
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to th
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to th
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to th
    lblSeedKnobReverb:                      "reverb", // TODO: translate to th
    lblSeedInstrument:                      "เครื่องดนตรี",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to th
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to th
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to th
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to th
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to th
    tabSeedRender:                          "Render", // TODO: translate to th
    lblSeedKnobVolume:                      "Volume", // TODO: translate to th
    lblSeedKnobOctave:                      "Octave", // TODO: translate to th
    lblSeedKnobTune:                        "Tune", // TODO: translate to th
    tipSeedMute:                            "Mute", // TODO: translate to th
    tipSeedUnmute:                          "Unmute", // TODO: translate to th
    lblSeedReverb:                          "Reverb", // TODO: translate to th
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to th
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to th
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to th
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to th
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to th
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to th
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to th
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to th
    optSeedInstrumentSine:                  "ไซน์: ซินธ์ในตัว",
    lblSeedFormat:                          "รูปแบบ",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "บิตเรต MP3",
    lblSeedName:                            "ชื่อ",
    lblSeedOutput:                          "เอาต์พุต",
    hntSeedOutput:                          "ชื่อพื้นฐานของไฟล์ที่เรนเดอร์ โทเค็นที่ถูกแทนที่เมื่อเรนเดอร์: {name}, {chords} (คอร์ด 8 ตัวแรก), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "เรนเดอร์ซีด",
    btnSeedPlay:                            "เล่น",
    btnSeedStop:                            "หยุด",
    msgSeedPlayFailed:                      "เล่นล้มเหลว",
    hntSeedRenderNeedsSave:                 "บันทึก seed ลงในไฟล์ .yams ก่อน — เสียงจะถูกเรนเดอร์ถัดจากไฟล์นั้น",
    tipSeedLoad:                            "โหลด Seed",
    ttlSeedLoad:                            "เปิดไฟล์ Seed",
    lblSeedLoadFilter:                      "ไฟล์ Seed (.yams)",
    msgSeedLoadFailed:                      "ไม่สามารถโหลดไฟล์ Seed นั้นได้",
    tipSeedNew:                             "เมล็ดพันธุ์ใหม่",
    tipSeedTabClose:                        "ปิด",
    lblSeedUntitled:                        "ไม่มีชื่อ",
    tipSeedSave:                            "บันทึก seed",
    tipSeedSaveAs:                          "บันทึก seed เป็น…",
    ttlSeedSaveAs:                          "บันทึก seed เป็น",
    msgSeedSaveFailed:                      "ไม่สามารถบันทึก seed ได้",
    msgSeedDropHere:                        "ลากไฟล์ .yams seed มาวางเพื่อโหลด",
    msgSeedBusy:                            "กำลังเรนเดอร์…",
    msgSeedEmpty:                           "โปรดป้อนคอร์ดโปรเกรสชันก่อน",
    msgSeedFailed:                          "เรนเดอร์ล้มเหลว",
    lblSeedResult:                          "บันทึกแล้ว",
    hntSeedResult:                          "อัปโหลด Audio Seed ไปยัง Suno (Cover) มันจะตามฮาร์โมนีที่ได้ยิน ไม่ใช่ชื่อคอร์ดที่คุณพิมพ์",
    msgSeedBusyInstrument:                  "กำลังโหลดเครื่องดนตรี…",
    msgSeedBusyRender:                      "กำลังเรนเดอร์เสียง…",
    msgSeedBusySave:                        "กำลังบันทึก…",
    lblSeedSummaryChords:                   "คอร์ด",
    lblSeedSummaryDuration:                 "ระยะเวลา",
    lblSeedSummarySize:                     "ขนาดโดยประมาณ",
    msgSeedSummaryInvalid:                  "ไม่รู้จัก:",
    msgSeedSummarySigBad:                   "อัตราจังหวะไม่ถูกต้อง",

  },

  id: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Batal",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Versi baru tersedia:",
    lnkUpdateWhatsNew:                      "Apa yang baru",
    btnUpdateDownload:                      "Unduh",
    lnkUpdateSkip:                          "Lewati versi ini",
    tipUpdateDismiss:                       "Abaikan",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Buka pengaturan",
    tipHdrHelp:                             "Bantuan",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Pengaturan",
    tabDlgSettingsDisplay:                  "Tampilan",
    tabDlgSettingsAbout:                    "Tentang",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Bahasa",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Gelap",
    btnDlgSettingsDisplayThemeLight:        "Terang",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Menghasilkan progresi akor menjadi benih audio + MIDI yang membatasi generator musik AI seperti Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progresi akor",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Satu birama per baris: setiap baris mendapat waktu yang sama, dan akor di dalamnya membagi waktu itu secara merata (satu akor saja dalam satu baris menempati seluruh birama). Tag [Section], baris kosong, dan tanda | diabaikan. Akor slash (C/G), 7ths (Gmaj7), dan N.C. didukung.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Birama per baris",
    lblSeedSig:                             "Tanda birama",
    lblSeedLoops:                           "Loop",
    lblSeedStyle:                           "Gaya",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to id
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to id
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to id
    optSeedStylePad:                        "Pad", // TODO: translate to id
    optSeedStyleDrone:                      "Drone", // TODO: translate to id
    optSeedStyleMarker:                     "Marker", // TODO: translate to id
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to id
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to id
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to id
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to id
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to id
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to id
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to id
    lblSeedKnobReverb:                      "reverb", // TODO: translate to id
    lblSeedInstrument:                      "Instrumen",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to id
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to id
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to id
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to id
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to id
    tabSeedRender:                          "Render", // TODO: translate to id
    lblSeedKnobVolume:                      "Volume", // TODO: translate to id
    lblSeedKnobOctave:                      "Octave", // TODO: translate to id
    lblSeedKnobTune:                        "Tune", // TODO: translate to id
    tipSeedMute:                            "Mute", // TODO: translate to id
    tipSeedUnmute:                          "Unmute", // TODO: translate to id
    lblSeedReverb:                          "Reverb", // TODO: translate to id
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to id
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to id
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to id
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to id
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to id
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to id
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to id
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to id
    optSeedInstrumentSine:                  "Sinus: synth bawaan",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nama",
    lblSeedOutput:                          "Keluaran",
    hntSeedOutput:                          "Nama dasar file yang dirender. Token yang diganti saat render: {name}, {chords} (8 akor pertama), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Render seed",
    btnSeedPlay:                            "Putar",
    btnSeedStop:                            "Berhenti",
    msgSeedPlayFailed:                      "Pemutaran gagal",
    hntSeedRenderNeedsSave:                 "Simpan seed ke file .yams terlebih dahulu — audio akan dirender di sebelahnya.",
    tipSeedLoad:                            "Muat seed",
    ttlSeedLoad:                            "Buka file seed",
    lblSeedLoadFilter:                      "File seed (.yams)",
    msgSeedLoadFailed:                      "Tidak dapat memuat file seed tersebut",
    tipSeedNew:                             "Seed baru",
    tipSeedTabClose:                        "Tutup",
    lblSeedUntitled:                        "Tanpa judul",
    tipSeedSave:                            "Simpan seed",
    tipSeedSaveAs:                          "Simpan seed sebagai…",
    ttlSeedSaveAs:                          "Simpan seed sebagai",
    msgSeedSaveFailed:                      "Tidak dapat menyimpan seed",
    msgSeedDropHere:                        "Jatuhkan berkas seed .yams untuk memuatnya",
    msgSeedBusy:                            "Merender…",
    msgSeedEmpty:                           "Masukkan progresi akor terlebih dahulu.",
    msgSeedFailed:                          "Render gagal",
    lblSeedResult:                          "Tersimpan",
    hntSeedResult:                          "Unggah seed audio ke Suno (Cover). Ini mengikuti harmoni yang didengarnya, bukan nama akor yang Anda ketik.",
    msgSeedBusyInstrument:                  "Memuat instrumen…",
    msgSeedBusyRender:                      "Merender audio…",
    msgSeedBusySave:                        "Menyimpan…",
    lblSeedSummaryChords:                   "Akor",
    lblSeedSummaryDuration:                 "Durasi",
    lblSeedSummarySize:                     "Ukuran perkiraan",
    msgSeedSummaryInvalid:                  "Tidak dikenali:",
    msgSeedSummarySigBad:                   "Tanda birama tidak valid",

  },

  ca: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Cancel·la",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nova versió disponible:",
    lnkUpdateWhatsNew:                      "Novetats",
    btnUpdateDownload:                      "Baixa",
    lnkUpdateSkip:                          "Omet aquesta versió",
    tipUpdateDismiss:                       "Descarta",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Obre la configuració",
    tipHdrHelp:                             "Ajuda",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Configuració",
    tabDlgSettingsDisplay:                  "Visualització",
    tabDlgSettingsAbout:                    "Quant a",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Idioma",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Fosc",
    btnDlgSettingsDisplayThemeLight:        "Clar",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genera progressions d'acords a llavors d'àudio + MIDI que restringeixen generadors de música IA com Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progressió d'acords",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Un compàs per línia: cada línia té la mateixa durada, i els acords la divideixen equitativament (un acord sol en una línia ocupa tot el compàs). Les etiquetes [Section], línies en blanc i | s'ignoren. Acords amb barra (C/G), 7es (Gmaj7) i N.C. compatibles.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Compasos per línia",
    lblSeedSig:                             "Compàs",
    lblSeedLoops:                           "Bucles",
    lblSeedStyle:                           "Estil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ca
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ca
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ca
    optSeedStylePad:                        "Pad", // TODO: translate to ca
    optSeedStyleDrone:                      "Drone", // TODO: translate to ca
    optSeedStyleMarker:                     "Marker", // TODO: translate to ca
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ca
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ca
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ca
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ca
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ca
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ca
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ca
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ca
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ca
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ca
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ca
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ca
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ca
    tabSeedRender:                          "Render", // TODO: translate to ca
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ca
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ca
    lblSeedKnobTune:                        "Tune", // TODO: translate to ca
    tipSeedMute:                            "Mute", // TODO: translate to ca
    tipSeedUnmute:                          "Unmute", // TODO: translate to ca
    lblSeedReverb:                          "Reverb", // TODO: translate to ca
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ca
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ca
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ca
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ca
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ca
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ca
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ca
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ca
    optSeedInstrumentSine:                  "Sinus: sintetitzador integrat",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nom",
    lblSeedOutput:                          "Sortida",
    hntSeedOutput:                          "Nom base dels fitxers renderitzats. Tokens substituïts en renderitzar: {name}, {chords} (els 8 primers acords), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderitza la llavor",
    btnSeedPlay:                            "Reprodueix",
    btnSeedStop:                            "Atura",
    msgSeedPlayFailed:                      "Ha fallat la reproducció",
    hntSeedRenderNeedsSave:                 "Desa la llavor en un fitxer .yams primer — l'àudio es renderitza al costat.",
    tipSeedLoad:                            "Carrega llavor",
    ttlSeedLoad:                            "Obre un fitxer de llavor",
    lblSeedLoadFilter:                      "Fitxer de llavor (.yams)",
    msgSeedLoadFailed:                      "No s'ha pogut carregar aquest fitxer de llavor",
    tipSeedNew:                             "Nova llavor",
    tipSeedTabClose:                        "Tanca",
    lblSeedUntitled:                        "Sense títol",
    tipSeedSave:                            "Desa la llavor",
    tipSeedSaveAs:                          "Desa la llavor com a…",
    ttlSeedSaveAs:                          "Desa la llavor com a",
    msgSeedSaveFailed:                      "No s'ha pogut desar la llavor",
    msgSeedDropHere:                        "Arrossegueu un fitxer de llavor .yams per carregar-lo",
    msgSeedBusy:                            "Renderitzant…",
    msgSeedEmpty:                           "Introduïu primer una progressió d'acords.",
    msgSeedFailed:                          "Ha fallat la renderització",
    lblSeedResult:                          "Guardat",
    hntSeedResult:                          "Puja la llavor d'àudio a Suno (Cover). Segueix l'harmonia que escolta, no els noms d'acords que escrius.",
    msgSeedBusyInstrument:                  "Carregant instrument…",
    msgSeedBusyRender:                      "Renderitzant àudio…",
    msgSeedBusySave:                        "Desant…",
    lblSeedSummaryChords:                   "Acords",
    lblSeedSummaryDuration:                 "Durada",
    lblSeedSummarySize:                     "Mida estimada",
    msgSeedSummaryInvalid:                  "No reconegut:",
    msgSeedSummarySigBad:                   "Compàs no vàlid",

  },

  cs: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Zrušit",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nová verze je k dispozici:",
    lnkUpdateWhatsNew:                      "Co je nového",
    btnUpdateDownload:                      "Stáhnout",
    lnkUpdateSkip:                          "Přeskočit tuto verzi",
    tipUpdateDismiss:                       "Zavřít",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Otevřít nastavení",
    tipHdrHelp:                             "Nápověda",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Nastavení",
    tabDlgSettingsDisplay:                  "Zobrazení",
    tabDlgSettingsAbout:                    "O aplikaci",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Jazyk",
    lblDlgSettingsDisplayTheme:             "Motiv",
    btnDlgSettingsDisplayThemeDark:         "Tmavý",
    btnDlgSettingsDisplayThemeLight:        "Světlý",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Generuje akordové progrese jako audio + MIDI semena, která omezují generátory hudby AI, jako je Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akordová progrese",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Jeden takt na řádek: každý řádek má stejný čas a akordy na něm si tento čas rovnoměrně rozdělí (samostatný akord na řádku zabírá celý takt). Značky [Section], prázdné řádky a | jsou ignorovány. Podporovány jsou lomítkové akordy (C/G), septimové (Gmaj7) a N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takty na řádek",
    lblSeedSig:                             "Taktové označení",
    lblSeedLoops:                           "Smyčky",
    lblSeedStyle:                           "Styl",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to cs
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to cs
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to cs
    optSeedStylePad:                        "Pad", // TODO: translate to cs
    optSeedStyleDrone:                      "Drone", // TODO: translate to cs
    optSeedStyleMarker:                     "Marker", // TODO: translate to cs
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to cs
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to cs
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to cs
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to cs
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to cs
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to cs
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to cs
    lblSeedKnobReverb:                      "reverb", // TODO: translate to cs
    lblSeedInstrument:                      "Nástroj",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to cs
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to cs
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to cs
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to cs
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to cs
    tabSeedRender:                          "Render", // TODO: translate to cs
    lblSeedKnobVolume:                      "Volume", // TODO: translate to cs
    lblSeedKnobOctave:                      "Octave", // TODO: translate to cs
    lblSeedKnobTune:                        "Tune", // TODO: translate to cs
    tipSeedMute:                            "Mute", // TODO: translate to cs
    tipSeedUnmute:                          "Unmute", // TODO: translate to cs
    lblSeedReverb:                          "Reverb", // TODO: translate to cs
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to cs
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to cs
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to cs
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to cs
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to cs
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to cs
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to cs
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to cs
    optSeedInstrumentSine:                  "Sinus: vestavěný syntezátor",
    lblSeedFormat:                          "Formát",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitrate",
    lblSeedName:                            "Název",
    lblSeedOutput:                          "Výstup",
    hntSeedOutput:                          "Základní název renderovaných souborů. Tokeny nahrazené při renderování: {name}, {chords} (prvních 8 akordů), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Vykreslit seed",
    btnSeedPlay:                            "Přehrát",
    btnSeedStop:                            "Zastavit",
    msgSeedPlayFailed:                      "Přehrávání se nezdařilo",
    hntSeedRenderNeedsSave:                 "Nejprve uložte seed do souboru .yams — zvuk se vykreslí vedle něj.",
    tipSeedLoad:                            "Načíst seed",
    ttlSeedLoad:                            "Otevřít soubor seed",
    lblSeedLoadFilter:                      "Soubor seed (.yams)",
    msgSeedLoadFailed:                      "Nepodařilo se načíst tento soubor seed",
    tipSeedNew:                             "Nové semeno",
    tipSeedTabClose:                        "Zavřít",
    lblSeedUntitled:                        "Bez názvu",
    tipSeedSave:                            "Uložit semínko",
    tipSeedSaveAs:                          "Uložit semínko jako…",
    ttlSeedSaveAs:                          "Uložit semínko jako",
    msgSeedSaveFailed:                      "Nepodařilo se uložit semínko",
    msgSeedDropHere:                        "Přetáhněte soubor .yams seed pro načtení",
    msgSeedBusy:                            "Vykreslování…",
    msgSeedEmpty:                           "Nejprve zadejte akordovou progresi.",
    msgSeedFailed:                          "Vykreslení selhalo",
    lblSeedResult:                          "Uloženo",
    hntSeedResult:                          "Nahrajte zvukový seed do Suno (Cover). Řídí se harmonií, kterou slyší, nikoli názvy akordů, které zadáváte.",
    msgSeedBusyInstrument:                  "Načítání nástroje…",
    msgSeedBusyRender:                      "Vykreslování zvuku…",
    msgSeedBusySave:                        "Ukládání…",
    lblSeedSummaryChords:                   "Akordy",
    lblSeedSummaryDuration:                 "Doba trvání",
    lblSeedSummarySize:                     "Odhad. velikost",
    msgSeedSummaryInvalid:                  "Nerozpoznáno:",
    msgSeedSummarySigBad:                   "Neplatné taktové označení",

  },

  da: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Annuller",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Ny version tilgængelig:",
    lnkUpdateWhatsNew:                      "Hvad er nyt",
    btnUpdateDownload:                      "Download",
    lnkUpdateSkip:                          "Spring denne version over",
    tipUpdateDismiss:                       "Afvis",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Åbn indstillinger",
    tipHdrHelp:                             "Hjælp",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Indstillinger",
    tabDlgSettingsDisplay:                  "Skærm",
    tabDlgSettingsAbout:                    "Om",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Sprog",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Mørk",
    btnDlgSettingsDisplayThemeLight:        "Lys",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Genererer akkordprogressioner som lyd- og MIDI-frø, der begrænser AI-musikgeneratorer som Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akkordprogression",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Én takt pr. linje: hver linje får lige lang tid, og akkorderne på den deler tiden jævnt (en akkord alene på en linje holder hele takten). [Section]-tags, tomme linjer og | ignoreres. Skråstregakkorder (C/G), 7'ere (Gmaj7) og N.C. understøttes.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takter per linje",
    lblSeedSig:                             "Taktart",
    lblSeedLoops:                           "Gentagelser",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to da
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to da
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to da
    optSeedStylePad:                        "Pad", // TODO: translate to da
    optSeedStyleDrone:                      "Drone", // TODO: translate to da
    optSeedStyleMarker:                     "Marker", // TODO: translate to da
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to da
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to da
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to da
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to da
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to da
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to da
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to da
    lblSeedKnobReverb:                      "reverb", // TODO: translate to da
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to da
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to da
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to da
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to da
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to da
    tabSeedRender:                          "Render", // TODO: translate to da
    lblSeedKnobVolume:                      "Volume", // TODO: translate to da
    lblSeedKnobOctave:                      "Octave", // TODO: translate to da
    lblSeedKnobTune:                        "Tune", // TODO: translate to da
    tipSeedMute:                            "Mute", // TODO: translate to da
    tipSeedUnmute:                          "Unmute", // TODO: translate to da
    lblSeedReverb:                          "Reverb", // TODO: translate to da
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to da
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to da
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to da
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to da
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to da
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to da
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to da
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to da
    optSeedInstrumentSine:                  "Sinus: indbygget synth",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3-bitrate",
    lblSeedName:                            "Navn",
    lblSeedOutput:                          "Output",
    hntSeedOutput:                          "Basisnavn for de renderede filer. Tokens erstattes ved rendering: {name}, {chords} (de første 8 akkorder), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Render seed",
    btnSeedPlay:                            "Afspil",
    btnSeedStop:                            "Stop",
    msgSeedPlayFailed:                      "Afspilning mislykkedes",
    hntSeedRenderNeedsSave:                 "Gem seedet i en .yams-fil først — lyden gengives ved siden af den.",
    tipSeedLoad:                            "Indlæs seed",
    ttlSeedLoad:                            "Åbn seed-fil",
    lblSeedLoadFilter:                      "Seed-fil (.yams)",
    msgSeedLoadFailed:                      "Kunne ikke indlæse den seed-fil",
    tipSeedNew:                             "Nyt frø",
    tipSeedTabClose:                        "Luk",
    lblSeedUntitled:                        "Uden titel",
    tipSeedSave:                            "Gem seed",
    tipSeedSaveAs:                          "Gem seed som…",
    ttlSeedSaveAs:                          "Gem seed som",
    msgSeedSaveFailed:                      "Kunne ikke gemme seed",
    msgSeedDropHere:                        "Træk en .yams seed-fil herover for at indlæse den",
    msgSeedBusy:                            "Renderer…",
    msgSeedEmpty:                           "Indtast først en akkordprogression.",
    msgSeedFailed:                          "Gengivelse mislykkedes",
    lblSeedResult:                          "Gemt",
    hntSeedResult:                          "Upload lydfrøet til Suno (Cover). Den følger den harmoni, den hører, ikke de akkordnavne, du skriver.",
    msgSeedBusyInstrument:                  "Indlæser instrument…",
    msgSeedBusyRender:                      "Gengiver lyd…",
    msgSeedBusySave:                        "Gemmer…",
    lblSeedSummaryChords:                   "Akkorder",
    lblSeedSummaryDuration:                 "Varighed",
    lblSeedSummarySize:                     "Est. størrelse",
    msgSeedSummaryInvalid:                  "Ukendt:",
    msgSeedSummarySigBad:                   "Ugyldig taktart",

  },

  fi: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Peruuta",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Uusi versio saatavilla:",
    lnkUpdateWhatsNew:                      "Mitä uutta",
    btnUpdateDownload:                      "Lataa",
    lnkUpdateSkip:                          "Ohita tämä versio",
    tipUpdateDismiss:                       "Hylkää",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Avaa asetukset",
    tipHdrHelp:                             "Ohje",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Asetukset",
    tabDlgSettingsDisplay:                  "Näyttö",
    tabDlgSettingsAbout:                    "Tietoja",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Kieli",
    lblDlgSettingsDisplayTheme:             "Teema",
    btnDlgSettingsDisplayThemeDark:         "Tumma",
    btnDlgSettingsDisplayThemeLight:        "Vaalea",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Luo sointukulkuja ääni- ja MIDI-siemeniksi, jotka rajoittavat tekoälymusiikkigeneraattoreita kuten Sunoa.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Sointukulku",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Yksi tahti per rivi: jokainen rivi saa yhtä paljon aikaa, ja sen soinnut jakavat ajan tasaisesti (yksi sointu rivillä vie koko tahdin). [Section]-tagit, tyhjät rivit ja | merkit ohitetaan. Vinoviivasoinnut (C/G), 7-soinnut (Gmaj7) ja N.C. tuetaan.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Tahdit per rivi",
    lblSeedSig:                             "Tahtilaji",
    lblSeedLoops:                           "Silmukat",
    lblSeedStyle:                           "Tyyli",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to fi
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to fi
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to fi
    optSeedStylePad:                        "Pad", // TODO: translate to fi
    optSeedStyleDrone:                      "Drone", // TODO: translate to fi
    optSeedStyleMarker:                     "Marker", // TODO: translate to fi
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to fi
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to fi
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to fi
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to fi
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to fi
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to fi
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to fi
    lblSeedKnobReverb:                      "reverb", // TODO: translate to fi
    lblSeedInstrument:                      "Instrumentti",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to fi
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to fi
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to fi
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to fi
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to fi
    tabSeedRender:                          "Render", // TODO: translate to fi
    lblSeedKnobVolume:                      "Volume", // TODO: translate to fi
    lblSeedKnobOctave:                      "Octave", // TODO: translate to fi
    lblSeedKnobTune:                        "Tune", // TODO: translate to fi
    tipSeedMute:                            "Mute", // TODO: translate to fi
    tipSeedUnmute:                          "Unmute", // TODO: translate to fi
    lblSeedReverb:                          "Reverb", // TODO: translate to fi
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to fi
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to fi
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to fi
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to fi
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to fi
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to fi
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to fi
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to fi
    optSeedInstrumentSine:                  "Siniaalto: sisäänrakennettu syntikka",
    lblSeedFormat:                          "Muoto",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3-bittinopeus",
    lblSeedName:                            "Nimi",
    lblSeedOutput:                          "Tuloste",
    hntSeedOutput:                          "Renderöityjen tiedostojen perusnimi. Renderöinnissä korvattavat tunnukset: {name}, {chords} (ensimmäiset 8 sointua), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderöi siemen",
    btnSeedPlay:                            "Toista",
    btnSeedStop:                            "Pysäytä",
    msgSeedPlayFailed:                      "Toisto epäonnistui",
    hntSeedRenderNeedsSave:                 "Tallenna siemen ensin .yams-tiedostoon — ääni renderöidään sen viereen.",
    tipSeedLoad:                            "Lataa siemen",
    ttlSeedLoad:                            "Avaa siementiedosto",
    lblSeedLoadFilter:                      "Siementiedosto (.yams)",
    msgSeedLoadFailed:                      "Tätä siementiedostoa ei voitu ladata",
    tipSeedNew:                             "Uusi siemen",
    tipSeedTabClose:                        "Sulje",
    lblSeedUntitled:                        "Nimetön",
    tipSeedSave:                            "Tallenna siemen",
    tipSeedSaveAs:                          "Tallenna siemen nimellä…",
    ttlSeedSaveAs:                          "Tallenna siemen nimellä",
    msgSeedSaveFailed:                      "Siemenen tallentaminen epäonnistui",
    msgSeedDropHere:                        "Pudota .yams-siementiedosto ladataksesi sen",
    msgSeedBusy:                            "Renderöi…",
    msgSeedEmpty:                           "Anna ensin sointukulku.",
    msgSeedFailed:                          "Renderöinti epäonnistui",
    lblSeedResult:                          "Tallennettu",
    hntSeedResult:                          "Lataa äänisiemen Sunoon (Cover). Se seuraa kuulemaansa harmoniaa, ei kirjoittamiasi sointunimiä.",
    msgSeedBusyInstrument:                  "Ladataan instrumenttia…",
    msgSeedBusyRender:                      "Renderöi ääntä…",
    msgSeedBusySave:                        "Tallennetaan…",
    lblSeedSummaryChords:                   "Soinnut",
    lblSeedSummaryDuration:                 "Kesto",
    lblSeedSummarySize:                     "Arvioitu koko",
    msgSeedSummaryInvalid:                  "Tunnistamaton:",
    msgSeedSummarySigBad:                   "Virheellinen tahtilaji",

  },

  ms: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Batal",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Versi baharu tersedia:",
    lnkUpdateWhatsNew:                      "Apa yang baharu",
    btnUpdateDownload:                      "Muat turun",
    lnkUpdateSkip:                          "Langkau versi ini",
    tipUpdateDismiss:                       "Abaikan",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Buka tetapan",
    tipHdrHelp:                             "Bantuan",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Tetapan",
    tabDlgSettingsDisplay:                  "Paparan",
    tabDlgSettingsAbout:                    "Mengenai",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Bahasa",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Gelap",
    btnDlgSettingsDisplayThemeLight:        "Cerah",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Menghasilkan progresi kord kepada benih audio + MIDI yang mengekang penjana muzik AI seperti Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progresi kord",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Satu bar per baris: setiap baris mendapat masa yang sama, dan kord di atasnya membahagi masa itu secara sama rata (satu kord sahaja pada satu baris memegang keseluruhan bar). Tag [Section], baris kosong dan tanda | diabaikan. Kord slash (C/G), 7ths (Gmaj7) dan N.C. disokong.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Bar per baris",
    lblSeedSig:                             "Tanda masa",
    lblSeedLoops:                           "Gelung",
    lblSeedStyle:                           "Gaya",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ms
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ms
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ms
    optSeedStylePad:                        "Pad", // TODO: translate to ms
    optSeedStyleDrone:                      "Drone", // TODO: translate to ms
    optSeedStyleMarker:                     "Marker", // TODO: translate to ms
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ms
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ms
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ms
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ms
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ms
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ms
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ms
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ms
    lblSeedInstrument:                      "Instrumen",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ms
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ms
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ms
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ms
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ms
    tabSeedRender:                          "Render", // TODO: translate to ms
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ms
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ms
    lblSeedKnobTune:                        "Tune", // TODO: translate to ms
    tipSeedMute:                            "Mute", // TODO: translate to ms
    tipSeedUnmute:                          "Unmute", // TODO: translate to ms
    lblSeedReverb:                          "Reverb", // TODO: translate to ms
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ms
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ms
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ms
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ms
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ms
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ms
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ms
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ms
    optSeedInstrumentSine:                  "Sinus: sintesis terbina dalam",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Kadar bit MP3",
    lblSeedName:                            "Nama",
    lblSeedOutput:                          "Output",
    hntSeedOutput:                          "Nama asas fail yang dirender. Token diganti semasa render: {name}, {chords} (8 kord pertama), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Render benih",
    btnSeedPlay:                            "Main",
    btnSeedStop:                            "Henti",
    msgSeedPlayFailed:                      "Main semula gagal",
    hntSeedRenderNeedsSave:                 "Simpan seed ke fail .yams dahulu — audio akan dirender di sebelahnya.",
    tipSeedLoad:                            "Muat seed",
    ttlSeedLoad:                            "Buka fail seed",
    lblSeedLoadFilter:                      "Fail seed (.yams)",
    msgSeedLoadFailed:                      "Tidak dapat memuatkan fail seed itu",
    tipSeedNew:                             "Benih baharu",
    tipSeedTabClose:                        "Tutup",
    lblSeedUntitled:                        "Tanpa tajuk",
    tipSeedSave:                            "Simpan seed",
    tipSeedSaveAs:                          "Simpan seed sebagai…",
    ttlSeedSaveAs:                          "Simpan seed sebagai",
    msgSeedSaveFailed:                      "Tidak dapat menyimpan seed",
    msgSeedDropHere:                        "Lepaskan fail benih .yams untuk memuatkannya",
    msgSeedBusy:                            "Sedang memapar…",
    msgSeedEmpty:                           "Masukkan jujukan kord dahulu.",
    msgSeedFailed:                          "Paparan gagal",
    lblSeedResult:                          "Disimpan",
    hntSeedResult:                          "Muat naik benih audio ke Suno (Cover). Ia mengikut harmoni yang didengarinya, bukan nama kord yang anda taip.",
    msgSeedBusyInstrument:                  "Memuatkan instrumen…",
    msgSeedBusyRender:                      "Sedang memapar audio…",
    msgSeedBusySave:                        "Sedang menyimpan…",
    lblSeedSummaryChords:                   "Kord",
    lblSeedSummaryDuration:                 "Tempoh",
    lblSeedSummarySize:                     "Anggaran saiz",
    msgSeedSummaryInvalid:                  "Tidak dikenali:",
    msgSeedSummarySigBad:                   "Tanda masa tidak sah",

  },

  hy: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Չեղարկել",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Նոր տարբերակ հասանելի է:",
    lnkUpdateWhatsNew:                      "Ինչ նորություն կա",
    btnUpdateDownload:                      "Ներբեռնել",
    lnkUpdateSkip:                          "Բաց թողնել այս տարբերակը",
    tipUpdateDismiss:                       "Մերժել",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Բացել կարգավորումները",
    tipHdrHelp:                             "Օգնություն",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Կարգավորումներ",
    tabDlgSettingsDisplay:                  "Ցուցադրում",
    tabDlgSettingsAbout:                    "Ծրագրի մասին",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Լեզու",
    lblDlgSettingsDisplayTheme:             "Թեմա",
    btnDlgSettingsDisplayThemeDark:         "Մուգ",
    btnDlgSettingsDisplayThemeLight:        "Բաց",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Ստեղծում է ակորդային հաջորդականություններ որպես աուդիո + MIDI սերմեր, որոնք սահմանափակում են AI երաժշտական գեներատորները, ինչպիսին է Suno-ն։",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Ակորդային հաջորդականություն",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Մեկ տակտ մեկ տողում. յուրաքանչյուր տող ստանում է հավասար ժամանակ, և դրա ակորդները հավասարաչափ բաժանում են այդ ժամանակը (մեկ ակորդը մեկ տողում զբաղեցնում է ամբողջ տակտը): [Section] թեգերը, դատարկ տողերը և | նշանները անտեսվում են: Աջակցվում են սլեշ ակորդները (C/G), 7-րդները (Gmaj7) և N.C.:",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Տակտեր տողի համար",
    lblSeedSig:                             "Ժամանակի չափ",
    lblSeedLoops:                           "Օղակներ",
    lblSeedStyle:                           "Ոճ",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to hy
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to hy
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to hy
    optSeedStylePad:                        "Pad", // TODO: translate to hy
    optSeedStyleDrone:                      "Drone", // TODO: translate to hy
    optSeedStyleMarker:                     "Marker", // TODO: translate to hy
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to hy
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to hy
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to hy
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to hy
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to hy
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to hy
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to hy
    lblSeedKnobReverb:                      "reverb", // TODO: translate to hy
    lblSeedInstrument:                      "Գործիք",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to hy
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to hy
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to hy
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to hy
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to hy
    tabSeedRender:                          "Render", // TODO: translate to hy
    lblSeedKnobVolume:                      "Volume", // TODO: translate to hy
    lblSeedKnobOctave:                      "Octave", // TODO: translate to hy
    lblSeedKnobTune:                        "Tune", // TODO: translate to hy
    tipSeedMute:                            "Mute", // TODO: translate to hy
    tipSeedUnmute:                          "Unmute", // TODO: translate to hy
    lblSeedReverb:                          "Reverb", // TODO: translate to hy
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to hy
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to hy
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to hy
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to hy
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to hy
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to hy
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to hy
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to hy
    optSeedInstrumentSine:                  "Սինուս: ներկառուցված սինթեզատոր",
    lblSeedFormat:                          "Ձևաչափ",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 բիթրեյթ",
    lblSeedName:                            "Անուն",
    lblSeedOutput:                          "Ելք",
    hntSeedOutput:                          "Ռենդերացված ֆայլերի հիմնական անունը։ Ռենդերացման ժամանակ փոխարինվող թոքեններ՝ {name}, {chords} (առաջին 8 ակորդները), {style}, {instrument}, {bpm}, {loops}։",
    btnSeedRender:                          "Ռենդեր սիդ",
    btnSeedPlay:                            "Նվագարկել",
    btnSeedStop:                            "Դադարեցնել",
    msgSeedPlayFailed:                      "Նվագարկումը ձախողվեց",
    hntSeedRenderNeedsSave:                 "Նախ պահպանեք սիդը .yams ֆայլում — աուդիոն կմշակվի դրա կողքին։",
    tipSeedLoad:                            "Բեռնել սիդ",
    ttlSeedLoad:                            "Բացել սիդ ֆայլը",
    lblSeedLoadFilter:                      "Սիդ ֆայլ (.yams)",
    msgSeedLoadFailed:                      "Հնարավոր չեղավ բեռնել այդ սիդ ֆայլը",
    tipSeedNew:                             "Նոր սերմ",
    tipSeedTabClose:                        "Փակել",
    lblSeedUntitled:                        "Անվերնագիր",
    tipSeedSave:                            "Պահպանել սերմը",
    tipSeedSaveAs:                          "Պահպանել սերմը որպես…",
    ttlSeedSaveAs:                          "Պահպանել սերմը որպես",
    msgSeedSaveFailed:                      "Հնարավոր չէր պահպանել սերմը",
    msgSeedDropHere:                        "Գցեք .yams seed ֆայլը՝ այն բեռնելու համար",
    msgSeedBusy:                            "Ռենդերում…",
    msgSeedEmpty:                           "Նախ մուտքագրեք ակորդների հաջորդականություն:",
    msgSeedFailed:                          "Ռենդերինգը ձախողվեց",
    lblSeedResult:                          "Պահպանված է",
    hntSeedResult:                          "Վերբեռնեք աուդիո սիդը Suno (Cover) հավելված։ Այն հետևում է լսած հարմոնիային, ոչ թե ձեր մուտքագրած ակորդների անուններին։",
    msgSeedBusyInstrument:                  "Գործիքի բեռնում…",
    msgSeedBusyRender:                      "Ձայնի ռենդերում…",
    msgSeedBusySave:                        "Պահպանում…",
    lblSeedSummaryChords:                   "Ակորդներ",
    lblSeedSummaryDuration:                 "Տևողություն",
    lblSeedSummarySize:                     "Մոտ. չափ",
    msgSeedSummaryInvalid:                  "Չճանաչված:",
    msgSeedSummarySigBad:                   "Անվավեր չափ",

  },

  bg: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Отказ",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Налична е нова версия:",
    lnkUpdateWhatsNew:                      "Какво ново",
    btnUpdateDownload:                      "Изтегли",
    lnkUpdateSkip:                          "Пропусни тази версия",
    tipUpdateDismiss:                       "Отхвърли",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Отвори настройки",
    tipHdrHelp:                             "Помощ",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Настройки",
    tabDlgSettingsDisplay:                  "Показване",
    tabDlgSettingsAbout:                    "Относно",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Език",
    lblDlgSettingsDisplayTheme:             "Тема",
    btnDlgSettingsDisplayThemeDark:         "Тъмен",
    btnDlgSettingsDisplayThemeLight:        "Светъл",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Генерира акордови прогресии като аудио + MIDI семена, които ограничават AI музикални генератори като Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Акордова прогресия",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Един такт на ред: всеки ред получава равно време, а акордите в него делят това време поравно (един акорд сам на ред заема целия такт). Таговете [Section], празните редове и | се игнорират. Поддържат се наклонени акорди (C/G), 7-ми (Gmaj7) и N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Тактове на ред",
    lblSeedSig:                             "Тактов размер",
    lblSeedLoops:                           "Цикли",
    lblSeedStyle:                           "Стил",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to bg
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to bg
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to bg
    optSeedStylePad:                        "Pad", // TODO: translate to bg
    optSeedStyleDrone:                      "Drone", // TODO: translate to bg
    optSeedStyleMarker:                     "Marker", // TODO: translate to bg
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to bg
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to bg
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to bg
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to bg
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to bg
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to bg
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to bg
    lblSeedKnobReverb:                      "reverb", // TODO: translate to bg
    lblSeedInstrument:                      "Инструмент",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to bg
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to bg
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to bg
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to bg
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to bg
    tabSeedRender:                          "Render", // TODO: translate to bg
    lblSeedKnobVolume:                      "Volume", // TODO: translate to bg
    lblSeedKnobOctave:                      "Octave", // TODO: translate to bg
    lblSeedKnobTune:                        "Tune", // TODO: translate to bg
    tipSeedMute:                            "Mute", // TODO: translate to bg
    tipSeedUnmute:                          "Unmute", // TODO: translate to bg
    lblSeedReverb:                          "Reverb", // TODO: translate to bg
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to bg
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to bg
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to bg
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to bg
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to bg
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to bg
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to bg
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to bg
    optSeedInstrumentSine:                  "Синус: вграден синтезатор",
    lblSeedFormat:                          "Формат",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 битрейт",
    lblSeedName:                            "Име",
    lblSeedOutput:                          "Изход",
    hntSeedOutput:                          "Базово име на рендираните файлове. Токени, заменяни при рендиране: {name}, {chords} (първите 8 акорда), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Рендирай сийд",
    btnSeedPlay:                            "Възпроизвеждане",
    btnSeedStop:                            "Спиране",
    msgSeedPlayFailed:                      "Възпроизвеждането е неуспешно",
    hntSeedRenderNeedsSave:                 "Първо запазете сида във файл .yams — аудиото се рендира до него.",
    tipSeedLoad:                            "Зареди сийд",
    ttlSeedLoad:                            "Отвори сийд файл",
    lblSeedLoadFilter:                      "Сийд файл (.yams)",
    msgSeedLoadFailed:                      "Не може да се зареди този сийд файл",
    tipSeedNew:                             "Ново семе",
    tipSeedTabClose:                        "Затвори",
    lblSeedUntitled:                        "Без заглавие",
    tipSeedSave:                            "Запазване на семе",
    tipSeedSaveAs:                          "Запазване на семе като…",
    ttlSeedSaveAs:                          "Запазване на семе като",
    msgSeedSaveFailed:                      "Не може да се запази семето",
    msgSeedDropHere:                        "Плъзнете .yams seed файл, за да го заредите",
    msgSeedBusy:                            "Рендиране…",
    msgSeedEmpty:                           "Първо въведете акордова прогресия.",
    msgSeedFailed:                          "Рендирането е неуспешно",
    lblSeedResult:                          "Запазено",
    hntSeedResult:                          "Качете аудио семето в Suno (Cover). То следва хармонията, която чува, а не имената на акордите, които въвеждате.",
    msgSeedBusyInstrument:                  "Зареждане на инструмент…",
    msgSeedBusyRender:                      "Рендиране на аудио…",
    msgSeedBusySave:                        "Записване…",
    lblSeedSummaryChords:                   "Акорди",
    lblSeedSummaryDuration:                 "Продължителност",
    lblSeedSummarySize:                     "Прибл. размер",
    msgSeedSummaryInvalid:                  "Неразпознато:",
    msgSeedSummarySigBad:                   "Невалиден размер",

  },

  gl: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Cancelar",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Nova versión dispoñible:",
    lnkUpdateWhatsNew:                      "Novidades",
    btnUpdateDownload:                      "Descargar",
    lnkUpdateSkip:                          "Omitir esta versión",
    tipUpdateDismiss:                       "Descartar",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Abrir configuración",
    tipHdrHelp:                             "Axuda",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Configuración",
    tabDlgSettingsDisplay:                  "Visualización",
    tabDlgSettingsAbout:                    "Acerca de",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Idioma",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Escuro",
    btnDlgSettingsDisplayThemeLight:        "Claro",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Xera progresións de acordes a sementes de audio + MIDI que restrinxen xeradores de música IA como Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Progresión de acordes",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Un compás por liña: cada liña recibe o mesmo tempo, e os acordes nela divídeno equitativamente (un acorde só nunha liña ocupa todo o compás). As etiquetas [Section], liñas en branco e | ignóranse. Acordes con barra (C/G), 7as (Gmaj7) e N.C. compatibles.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Compases por liña",
    lblSeedSig:                             "Compás",
    lblSeedLoops:                           "Bucles",
    lblSeedStyle:                           "Estilo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to gl
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to gl
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to gl
    optSeedStylePad:                        "Pad", // TODO: translate to gl
    optSeedStyleDrone:                      "Drone", // TODO: translate to gl
    optSeedStyleMarker:                     "Marker", // TODO: translate to gl
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to gl
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to gl
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to gl
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to gl
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to gl
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to gl
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to gl
    lblSeedKnobReverb:                      "reverb", // TODO: translate to gl
    lblSeedInstrument:                      "Instrumento",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to gl
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to gl
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to gl
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to gl
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to gl
    tabSeedRender:                          "Render", // TODO: translate to gl
    lblSeedKnobVolume:                      "Volume", // TODO: translate to gl
    lblSeedKnobOctave:                      "Octave", // TODO: translate to gl
    lblSeedKnobTune:                        "Tune", // TODO: translate to gl
    tipSeedMute:                            "Mute", // TODO: translate to gl
    tipSeedUnmute:                          "Unmute", // TODO: translate to gl
    lblSeedReverb:                          "Reverb", // TODO: translate to gl
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to gl
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to gl
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to gl
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to gl
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to gl
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to gl
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to gl
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to gl
    optSeedInstrumentSine:                  "Seno: sintetizador integrado",
    lblSeedFormat:                          "Formato",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Bitrate MP3",
    lblSeedName:                            "Nome",
    lblSeedOutput:                          "Saída",
    hntSeedOutput:                          "Nome base dos ficheiros renderizados. Tokens substituídos ao renderizar: {name}, {chords} (os 8 primeiros acordes), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderizar semente",
    btnSeedPlay:                            "Reproducir",
    btnSeedStop:                            "Deter",
    msgSeedPlayFailed:                      "Fallou a reprodución",
    hntSeedRenderNeedsSave:                 "Garda a semente nun ficheiro .yams primeiro — o audio renderízase xunto a el.",
    tipSeedLoad:                            "Cargar semente",
    ttlSeedLoad:                            "Abrir un ficheiro de semente",
    lblSeedLoadFilter:                      "Ficheiro de semente (.yams)",
    msgSeedLoadFailed:                      "Non se puido cargar ese ficheiro de semente",
    tipSeedNew:                             "Nova semente",
    tipSeedTabClose:                        "Pechar",
    lblSeedUntitled:                        "Sen título",
    tipSeedSave:                            "Gardar semente",
    tipSeedSaveAs:                          "Gardar semente como…",
    ttlSeedSaveAs:                          "Gardar semente como",
    msgSeedSaveFailed:                      "Non se puido gardar a semente",
    msgSeedDropHere:                        "Solte un ficheiro de semente .yams para cargalo",
    msgSeedBusy:                            "Renderizando…",
    msgSeedEmpty:                           "Introduce primeiro unha progresión de acordes.",
    msgSeedFailed:                          "Fallou a renderización",
    lblSeedResult:                          "Gardado",
    hntSeedResult:                          "Sube a semente de audio a Suno (Cover). Segue a harmonía que escoita, non os nomes de acordes que escribes.",
    msgSeedBusyInstrument:                  "Cargando instrumento…",
    msgSeedBusyRender:                      "Renderizando audio…",
    msgSeedBusySave:                        "Gardando…",
    lblSeedSummaryChords:                   "Acordes",
    lblSeedSummaryDuration:                 "Duración",
    lblSeedSummarySize:                     "Tamaño est.",
    msgSeedSummaryInvalid:                  "Non recoñecido:",
    msgSeedSummarySigBad:                   "Compás non válido",

  },

  hu: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Mégse",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Új verzió elérhető:",
    lnkUpdateWhatsNew:                      "Újdonságok",
    btnUpdateDownload:                      "Letöltés",
    lnkUpdateSkip:                          "Verzió kihagyása",
    tipUpdateDismiss:                       "Elvetés",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Beállítások megnyitása",
    tipHdrHelp:                             "Súgó",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Beállítások",
    tabDlgSettingsDisplay:                  "Megjelenítés",
    tabDlgSettingsAbout:                    "Névjegy",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Nyelv",
    lblDlgSettingsDisplayTheme:             "Téma",
    btnDlgSettingsDisplayThemeDark:         "Sötét",
    btnDlgSettingsDisplayThemeLight:        "Világos",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Akkordmeneteket generál audio + MIDI magokká, amelyek korlátozzák az AI zenei generátorokat, mint a Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akkordmenet",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Egy ütem soronként: minden sor egyenlő időt kap, és az azon lévő akkordok egyenletesen osztják el ezt az időt (egy akkord önmagában egy soron az egész ütemet kitölti). A [Section] címkék, üres sorok és a | jelek figyelmen kívül maradnak. Támogatottak a tört akkordok (C/G), 7-esek (Gmaj7) és az N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Ütemek soronként",
    lblSeedSig:                             "Ütemjelzés",
    lblSeedLoops:                           "Ismétlések",
    lblSeedStyle:                           "Stílus",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to hu
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to hu
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to hu
    optSeedStylePad:                        "Pad", // TODO: translate to hu
    optSeedStyleDrone:                      "Drone", // TODO: translate to hu
    optSeedStyleMarker:                     "Marker", // TODO: translate to hu
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to hu
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to hu
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to hu
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to hu
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to hu
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to hu
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to hu
    lblSeedKnobReverb:                      "reverb", // TODO: translate to hu
    lblSeedInstrument:                      "Hangszer",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to hu
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to hu
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to hu
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to hu
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to hu
    tabSeedRender:                          "Render", // TODO: translate to hu
    lblSeedKnobVolume:                      "Volume", // TODO: translate to hu
    lblSeedKnobOctave:                      "Octave", // TODO: translate to hu
    lblSeedKnobTune:                        "Tune", // TODO: translate to hu
    tipSeedMute:                            "Mute", // TODO: translate to hu
    tipSeedUnmute:                          "Unmute", // TODO: translate to hu
    lblSeedReverb:                          "Reverb", // TODO: translate to hu
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to hu
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to hu
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to hu
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to hu
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to hu
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to hu
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to hu
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to hu
    optSeedInstrumentSine:                  "Szinusz: beépített szintetizátor",
    lblSeedFormat:                          "Formátum",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitráta",
    lblSeedName:                            "Név",
    lblSeedOutput:                          "Kimenet",
    hntSeedOutput:                          "A renderelt fájlok alapneve. Rendereléskor cserélődő tokenek: {name}, {chords} (az első 8 akkord), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Seed renderelése",
    btnSeedPlay:                            "Lejátszás",
    btnSeedStop:                            "Leállítás",
    msgSeedPlayFailed:                      "Lejátszás sikertelen",
    hntSeedRenderNeedsSave:                 "Először mentse a seedet egy .yams fájlba — az audió mellette kerül renderelésre.",
    tipSeedLoad:                            "Seed betöltése",
    ttlSeedLoad:                            "Seed fájl megnyitása",
    lblSeedLoadFilter:                      "Seed fájl (.yams)",
    msgSeedLoadFailed:                      "Nem sikerült betölteni ezt a seed fájlt",
    tipSeedNew:                             "Új mag",
    tipSeedTabClose:                        "Bezárás",
    lblSeedUntitled:                        "Névtelen",
    tipSeedSave:                            "Mag mentése",
    tipSeedSaveAs:                          "Mag mentése másként…",
    ttlSeedSaveAs:                          "Mag mentése másként",
    msgSeedSaveFailed:                      "Nem sikerült menteni a magot",
    msgSeedDropHere:                        "Húzzon ide egy .yams seed fájlt a betöltéshez",
    msgSeedBusy:                            "Renderelés…",
    msgSeedEmpty:                           "Először adjon meg egy akkordmenetet.",
    msgSeedFailed:                          "Renderelés sikertelen",
    lblSeedResult:                          "Mentve",
    hntSeedResult:                          "Töltsd fel az audio seedet a Suno-ra (Cover). A hallott harmóniát követi, nem az általad beírt akkordneveket.",
    msgSeedBusyInstrument:                  "Hangszer betöltése…",
    msgSeedBusyRender:                      "Hang renderelése…",
    msgSeedBusySave:                        "Mentés…",
    lblSeedSummaryChords:                   "Akkordok",
    lblSeedSummaryDuration:                 "Időtartam",
    lblSeedSummarySize:                     "Becsült méret",
    msgSeedSummaryInvalid:                  "Felismeretlen:",
    msgSeedSummarySigBad:                   "Érvénytelen ütemjelzés",

  },

  lt: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Atšaukti",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Yra nauja versija:",
    lnkUpdateWhatsNew:                      "Kas naujo",
    btnUpdateDownload:                      "Atsisiųsti",
    lnkUpdateSkip:                          "Praleisti šią versiją",
    tipUpdateDismiss:                       "Atmesti",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Atidaryti nustatymus",
    tipHdrHelp:                             "Pagalba",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Nustatymai",
    tabDlgSettingsDisplay:                  "Rodymas",
    tabDlgSettingsAbout:                    "Apie",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Kalba",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Tamsus",
    btnDlgSettingsDisplayThemeLight:        "Šviesus",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Generuoja akordų progresijas kaip garso + MIDI sėklas, kurios apriboja AI muzikos generatorius, tokius kaip Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akordų progresija",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Vienas taktas eilutėje: kiekviena eilutė gauna vienodą laiką, o akordai joje pasidalija tą laiką tolygiai (vienas akordas eilutėje užima visą taktą). [Section] žymės, tuščios eilutės ir | ženklai ignoruojami. Palaikomi pasvirieji akordai (C/G), septakordai (Gmaj7) ir N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Taktų eilutėje",
    lblSeedSig:                             "Taktų skaičius",
    lblSeedLoops:                           "Ciklai",
    lblSeedStyle:                           "Stilius",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to lt
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to lt
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to lt
    optSeedStylePad:                        "Pad", // TODO: translate to lt
    optSeedStyleDrone:                      "Drone", // TODO: translate to lt
    optSeedStyleMarker:                     "Marker", // TODO: translate to lt
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to lt
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to lt
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to lt
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to lt
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to lt
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to lt
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to lt
    lblSeedKnobReverb:                      "reverb", // TODO: translate to lt
    lblSeedInstrument:                      "Instrumentas",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to lt
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to lt
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to lt
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to lt
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to lt
    tabSeedRender:                          "Render", // TODO: translate to lt
    lblSeedKnobVolume:                      "Volume", // TODO: translate to lt
    lblSeedKnobOctave:                      "Octave", // TODO: translate to lt
    lblSeedKnobTune:                        "Tune", // TODO: translate to lt
    tipSeedMute:                            "Mute", // TODO: translate to lt
    tipSeedUnmute:                          "Unmute", // TODO: translate to lt
    lblSeedReverb:                          "Reverb", // TODO: translate to lt
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to lt
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to lt
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to lt
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to lt
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to lt
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to lt
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to lt
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to lt
    optSeedInstrumentSine:                  "Sinusas: įmontuotas sintezatorius",
    lblSeedFormat:                          "Formatas",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitų sparta",
    lblSeedName:                            "Pavadinimas",
    lblSeedOutput:                          "Išvestis",
    hntSeedOutput:                          "Atvaizduotų failų bazinis pavadinimas. Atvaizdavimo metu pakeičiami žetonai: {name}, {chords} (pirmieji 8 akordai), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderinti sėklą",
    btnSeedPlay:                            "Groti",
    btnSeedStop:                            "Stabdyti",
    msgSeedPlayFailed:                      "Nepavyko paleisti",
    hntSeedRenderNeedsSave:                 "Pirmiausia išsaugokite sėklą .yams faile — garso įrašas bus atvaizduotas šalia jo.",
    tipSeedLoad:                            "Įkelti seed",
    ttlSeedLoad:                            "Atidaryti seed failą",
    lblSeedLoadFilter:                      "Seed failas (.yams)",
    msgSeedLoadFailed:                      "Nepavyko įkelti to seed failo",
    tipSeedNew:                             "Nauja sėkla",
    tipSeedTabClose:                        "Uždaryti",
    lblSeedUntitled:                        "Be pavadinimo",
    tipSeedSave:                            "Išsaugoti sėklą",
    tipSeedSaveAs:                          "Išsaugoti sėklą kaip…",
    ttlSeedSaveAs:                          "Išsaugoti sėklą kaip",
    msgSeedSaveFailed:                      "Nepavyko išsaugoti sėklos",
    msgSeedDropHere:                        "Nuvilkite .yams seed failą, kad jį įkeltumėte",
    msgSeedBusy:                            "Atvaizduojama…",
    msgSeedEmpty:                           "Pirmiausia įveskite akordų progresiją.",
    msgSeedFailed:                          "Atvaizdavimas nepavyko",
    lblSeedResult:                          "Išsaugota",
    hntSeedResult:                          "Įkelkite garso sėklą į Suno (Cover). Ji seka girdimą harmoniją, o ne jūsų įvestus akordų pavadinimus.",
    msgSeedBusyInstrument:                  "Įkeliamas instrumentas…",
    msgSeedBusyRender:                      "Garso atvaizdavimas…",
    msgSeedBusySave:                        "Išsaugoma…",
    lblSeedSummaryChords:                   "Akordai",
    lblSeedSummaryDuration:                 "Trukmė",
    lblSeedSummarySize:                     "Apytikslis dydis",
    msgSeedSummaryInvalid:                  "Neatpažinta:",
    msgSeedSummarySigBad:                   "Neteisingas taktas",

  },

  mk: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Откажи",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Достапна е нова верзија:",
    lnkUpdateWhatsNew:                      "Што е ново",
    btnUpdateDownload:                      "Преземи",
    lnkUpdateSkip:                          "Прескокни ја оваа верзија",
    tipUpdateDismiss:                       "Отфрли",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Отвори поставки",
    tipHdrHelp:                             "Помош",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Поставки",
    tabDlgSettingsDisplay:                  "Приказ",
    tabDlgSettingsAbout:                    "За програмата",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Јазик",
    lblDlgSettingsDisplayTheme:             "Тема",
    btnDlgSettingsDisplayThemeDark:         "Темно",
    btnDlgSettingsDisplayThemeLight:        "Светло",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Генерира акордни прогресии како аудио + MIDI семиња кои ги ограничуваат AI музичките генератори како Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Акордна прогресија",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Еден такт по линија: секоја линија добива еднакво време, а акордите на неа го делат тоа време рамномерно (еден акорд сам на линија го држи целиот такт). Ознаките [Section], празни линии и | се игнорираат. Поддржани се слеш акорди (C/G), 7-ми (Gmaj7) и N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Тактови по линија",
    lblSeedSig:                             "Тактов потпис",
    lblSeedLoops:                           "Јамки",
    lblSeedStyle:                           "Стил",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to mk
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to mk
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to mk
    optSeedStylePad:                        "Pad", // TODO: translate to mk
    optSeedStyleDrone:                      "Drone", // TODO: translate to mk
    optSeedStyleMarker:                     "Marker", // TODO: translate to mk
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to mk
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to mk
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to mk
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to mk
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to mk
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to mk
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to mk
    lblSeedKnobReverb:                      "reverb", // TODO: translate to mk
    lblSeedInstrument:                      "Инструмент",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to mk
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to mk
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to mk
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to mk
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to mk
    tabSeedRender:                          "Render", // TODO: translate to mk
    lblSeedKnobVolume:                      "Volume", // TODO: translate to mk
    lblSeedKnobOctave:                      "Octave", // TODO: translate to mk
    lblSeedKnobTune:                        "Tune", // TODO: translate to mk
    tipSeedMute:                            "Mute", // TODO: translate to mk
    tipSeedUnmute:                          "Unmute", // TODO: translate to mk
    lblSeedReverb:                          "Reverb", // TODO: translate to mk
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to mk
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to mk
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to mk
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to mk
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to mk
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to mk
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to mk
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to mk
    optSeedInstrumentSine:                  "Синус: вграден синтисајзер",
    lblSeedFormat:                          "Формат",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 битрејт",
    lblSeedName:                            "Име",
    lblSeedOutput:                          "Излез",
    hntSeedOutput:                          "Основно име на рендерираните датотеки. Токени заменети при рендерирање: {name}, {chords} (првите 8 акорди), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Рендерирај сид",
    btnSeedPlay:                            "Пушти",
    btnSeedStop:                            "Запри",
    msgSeedPlayFailed:                      "Неуспешна репродукција",
    hntSeedRenderNeedsSave:                 "Прво зачувајте го сидот во .yams датотека — аудиото се рендерира до него.",
    tipSeedLoad:                            "Вчитај сид",
    ttlSeedLoad:                            "Отвори сид датотека",
    lblSeedLoadFilter:                      "Сид датотека (.yams)",
    msgSeedLoadFailed:                      "Не можеше да се вчита таа сид датотека",
    tipSeedNew:                             "Ново семе",
    tipSeedTabClose:                        "Затвори",
    lblSeedUntitled:                        "Без наслов",
    tipSeedSave:                            "Зачувај семе",
    tipSeedSaveAs:                          "Зачувај семе како…",
    ttlSeedSaveAs:                          "Зачувај семе како",
    msgSeedSaveFailed:                      "Не можеше да се зачува семето",
    msgSeedDropHere:                        "Повлечете .yams seed датотека за да ја вчитате",
    msgSeedBusy:                            "Рендерирање…",
    msgSeedEmpty:                           "Прво внесете прогресија на акорди.",
    msgSeedFailed:                          "Рендерирањето не успеа",
    lblSeedResult:                          "Зачувано",
    hntSeedResult:                          "Поставете го аудио семето на Suno (Cover). Следи ја хармонијата што ја слуша, а не имињата на акордите што ги пишувате.",
    msgSeedBusyInstrument:                  "Вчитување инструмент…",
    msgSeedBusyRender:                      "Рендерирање аудио…",
    msgSeedBusySave:                        "Зачувување…",
    lblSeedSummaryChords:                   "Акорди",
    lblSeedSummaryDuration:                 "Времетраење",
    lblSeedSummarySize:                     "Проц. големина",
    msgSeedSummaryInvalid:                  "Непрепознаено:",
    msgSeedSummarySigBad:                   "Невалиден такт",

  },

  sr: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Откажи",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Доступна је нова верзија:",
    lnkUpdateWhatsNew:                      "Шта је ново",
    btnUpdateDownload:                      "Преузми",
    lnkUpdateSkip:                          "Прескочи ову верзију",
    tipUpdateDismiss:                       "Одбаци",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Отвори подешавања",
    tipHdrHelp:                             "Помоћ",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Подешавања",
    tabDlgSettingsDisplay:                  "Приказ",
    tabDlgSettingsAbout:                    "О програму",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Језик",
    lblDlgSettingsDisplayTheme:             "Тема",
    btnDlgSettingsDisplayThemeDark:         "Тамно",
    btnDlgSettingsDisplayThemeLight:        "Светло",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Генерише акордне прогресије као аудио + MIDI семена која ограничавају АИ музичке генераторе попут Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akordna progresija",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Један такт по реду: сваки ред добија једнако време, а акорди на њему деле то време равномерно (један акорд сам на реду заузима цео такт). Ознаке [Section], празни редови и | се игноришу. Подржани су коси акорди (C/G), 7-ми (Gmaj7) и N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Taktovi po redu",
    lblSeedSig:                             "Taktna oznaka",
    lblSeedLoops:                           "Petlje",
    lblSeedStyle:                           "Stil",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to sr
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to sr
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to sr
    optSeedStylePad:                        "Pad", // TODO: translate to sr
    optSeedStyleDrone:                      "Drone", // TODO: translate to sr
    optSeedStyleMarker:                     "Marker", // TODO: translate to sr
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to sr
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to sr
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to sr
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to sr
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to sr
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to sr
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to sr
    lblSeedKnobReverb:                      "reverb", // TODO: translate to sr
    lblSeedInstrument:                      "Инструмент",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to sr
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to sr
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to sr
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to sr
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to sr
    tabSeedRender:                          "Render", // TODO: translate to sr
    lblSeedKnobVolume:                      "Volume", // TODO: translate to sr
    lblSeedKnobOctave:                      "Octave", // TODO: translate to sr
    lblSeedKnobTune:                        "Tune", // TODO: translate to sr
    tipSeedMute:                            "Mute", // TODO: translate to sr
    tipSeedUnmute:                          "Unmute", // TODO: translate to sr
    lblSeedReverb:                          "Reverb", // TODO: translate to sr
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to sr
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to sr
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to sr
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to sr
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to sr
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to sr
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to sr
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to sr
    optSeedInstrumentSine:                  "Синус: уграђени синтисајзер",
    lblSeedFormat:                          "Формат",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 битрејт",
    lblSeedName:                            "Назив",
    lblSeedOutput:                          "Излаз",
    hntSeedOutput:                          "Основни назив рендерованих датотека. Токени замењени при рендеровању: {name}, {chords} (првих 8 акорда), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Рендеруј сид",
    btnSeedPlay:                            "Пусти",
    btnSeedStop:                            "Заустави",
    msgSeedPlayFailed:                      "Грешка при репродукцији",
    hntSeedRenderNeedsSave:                 "Прво сачувајте сид у .yams датотеку — аудио се рендерује поред ње.",
    tipSeedLoad:                            "Учитај сид",
    ttlSeedLoad:                            "Отвори сид датотеку",
    lblSeedLoadFilter:                      "Сид датотека (.yams)",
    msgSeedLoadFailed:                      "Није могуће учитати ту сид датотеку",
    tipSeedNew:                             "Ново семе",
    tipSeedTabClose:                        "Затвори",
    lblSeedUntitled:                        "Без наслова",
    tipSeedSave:                            "Сачувај семе",
    tipSeedSaveAs:                          "Сачувај семе као…",
    ttlSeedSaveAs:                          "Сачувај семе као",
    msgSeedSaveFailed:                      "Није могуће сачувати семе",
    msgSeedDropHere:                        "Превуците .yams seed датотеку да бисте је учитали",
    msgSeedBusy:                            "Рендеровање…",
    msgSeedEmpty:                           "Прво унесите прогресију акорда.",
    msgSeedFailed:                          "Рендеровање неуспешно",
    lblSeedResult:                          "Сачувано",
    hntSeedResult:                          "Отпремите аудио семе у Suno (Cover). Прати хармонију коју чује, а не називе акорда које уносите.",
    msgSeedBusyInstrument:                  "Учитавање инструмента…",
    msgSeedBusyRender:                      "Рендеровање звука…",
    msgSeedBusySave:                        "Чување…",
    lblSeedSummaryChords:                   "Акорди",
    lblSeedSummaryDuration:                 "Трајање",
    lblSeedSummarySize:                     "Проц. величина",
    msgSeedSummaryInvalid:                  "Непрепознато:",
    msgSeedSummarySigBad:                   "Неважећа мера",

  },

  sk: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Zrušiť",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "K dispozícii je nová verzia:",
    lnkUpdateWhatsNew:                      "Čo je nové",
    btnUpdateDownload:                      "Stiahnuť",
    lnkUpdateSkip:                          "Preskočiť túto verziu",
    tipUpdateDismiss:                       "Zavrieť",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Otvoriť nastavenia",
    tipHdrHelp:                             "Pomoc",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Nastavenia",
    tabDlgSettingsDisplay:                  "Zobrazenie",
    tabDlgSettingsAbout:                    "O aplikácii",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Jazyk",
    lblDlgSettingsDisplayTheme:             "Téma",
    btnDlgSettingsDisplayThemeDark:         "Tmavý",
    btnDlgSettingsDisplayThemeLight:        "Svetlý",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Generuje akordové progrese ako audio + MIDI semená, ktoré obmedzujú generátory hudby AI, ako je Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akordová progresia",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Jeden takt na riadok: každý riadok dostane rovnaký čas a akordy na ňom si tento čas rovnomerne rozdelia (samostatný akord na riadku zaberá celý takt). Značky [Section], prázdne riadky a | sú ignorované. Podporované sú lomítkové akordy (C/G), septimové (Gmaj7) a N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takty na riadok",
    lblSeedSig:                             "Taktové označenie",
    lblSeedLoops:                           "Slučky",
    lblSeedStyle:                           "Štýl",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to sk
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to sk
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to sk
    optSeedStylePad:                        "Pad", // TODO: translate to sk
    optSeedStyleDrone:                      "Drone", // TODO: translate to sk
    optSeedStyleMarker:                     "Marker", // TODO: translate to sk
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to sk
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to sk
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to sk
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to sk
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to sk
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to sk
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to sk
    lblSeedKnobReverb:                      "reverb", // TODO: translate to sk
    lblSeedInstrument:                      "Nástroj",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to sk
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to sk
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to sk
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to sk
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to sk
    tabSeedRender:                          "Render", // TODO: translate to sk
    lblSeedKnobVolume:                      "Volume", // TODO: translate to sk
    lblSeedKnobOctave:                      "Octave", // TODO: translate to sk
    lblSeedKnobTune:                        "Tune", // TODO: translate to sk
    tipSeedMute:                            "Mute", // TODO: translate to sk
    tipSeedUnmute:                          "Unmute", // TODO: translate to sk
    lblSeedReverb:                          "Reverb", // TODO: translate to sk
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to sk
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to sk
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to sk
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to sk
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to sk
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to sk
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to sk
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to sk
    optSeedInstrumentSine:                  "Sínus: vstavaný syntetizátor",
    lblSeedFormat:                          "Formát",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitrate",
    lblSeedName:                            "Názov",
    lblSeedOutput:                          "Výstup",
    hntSeedOutput:                          "Základný názov renderovaných súborov. Tokeny nahradené pri renderovaní: {name}, {chords} (prvých 8 akordov), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Vykresliť seed",
    btnSeedPlay:                            "Prehrať",
    btnSeedStop:                            "Zastaviť",
    msgSeedPlayFailed:                      "Prehrávanie zlyhalo",
    hntSeedRenderNeedsSave:                 "Najprv uložte seed do súboru .yams — zvuk sa vykreslí vedľa neho.",
    tipSeedLoad:                            "Načítať seed",
    ttlSeedLoad:                            "Otvoriť súbor seed",
    lblSeedLoadFilter:                      "Súbor seed (.yams)",
    msgSeedLoadFailed:                      "Nepodarilo sa načítať tento súbor seed",
    tipSeedNew:                             "Nové semeno",
    tipSeedTabClose:                        "Zavrieť",
    lblSeedUntitled:                        "Bez názvu",
    tipSeedSave:                            "Uložiť semienko",
    tipSeedSaveAs:                          "Uložiť semienko ako…",
    ttlSeedSaveAs:                          "Uložiť semienko ako",
    msgSeedSaveFailed:                      "Nepodarilo sa uložiť semienko",
    msgSeedDropHere:                        "Pretiahnite súbor .yams seed na načítanie",
    msgSeedBusy:                            "Vykresľovanie…",
    msgSeedEmpty:                           "Najprv zadajte akordovú progresiu.",
    msgSeedFailed:                          "Vykreslenie zlyhalo",
    lblSeedResult:                          "Uložené",
    hntSeedResult:                          "Nahrajte zvukový seed do Suno (Cover). Riadi sa harmóniou, ktorú počuje, nie názvami akordov, ktoré zadávate.",
    msgSeedBusyInstrument:                  "Načítava sa nástroj…",
    msgSeedBusyRender:                      "Vykresľovanie zvuku…",
    msgSeedBusySave:                        "Ukladanie…",
    lblSeedSummaryChords:                   "Akordy",
    lblSeedSummaryDuration:                 "Trvanie",
    lblSeedSummarySize:                     "Odhad. veľkosť",
    msgSeedSummaryInvalid:                  "Nerozpoznané:",
    msgSeedSummarySigBad:                   "Neplatné taktové označenie",

  },

  sl: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Prekliči",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Na voljo je nova različica:",
    lnkUpdateWhatsNew:                      "Kaj je novega",
    btnUpdateDownload:                      "Prenesi",
    lnkUpdateSkip:                          "Preskoči to različico",
    tipUpdateDismiss:                       "Zavrni",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Odpri nastavitve",
    tipHdrHelp:                             "Pomoč",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Nastavitve",
    tabDlgSettingsDisplay:                  "Prikaz",
    tabDlgSettingsAbout:                    "O programu",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Jezik",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Temno",
    btnDlgSettingsDisplayThemeLight:        "Svetlo",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Ustvarja akordne progresije kot avdio + MIDI semena, ki omejujejo AI generatorje glasbe, kot je Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Akordna progresija",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "En takt na vrstico: vsaka vrstica dobi enak čas, akordi na njej pa si ta čas enakomerno razdelijo (en sam akord na vrstici zasede celoten takt). Oznake [Section], prazne vrstice in | so prezrte. Podprti so poševni akordi (C/G), 7. (Gmaj7) in N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Takti na vrstico",
    lblSeedSig:                             "Taktovski podpis",
    lblSeedLoops:                           "Zanke",
    lblSeedStyle:                           "Slog",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to sl
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to sl
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to sl
    optSeedStylePad:                        "Pad", // TODO: translate to sl
    optSeedStyleDrone:                      "Drone", // TODO: translate to sl
    optSeedStyleMarker:                     "Marker", // TODO: translate to sl
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to sl
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to sl
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to sl
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to sl
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to sl
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to sl
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to sl
    lblSeedKnobReverb:                      "reverb", // TODO: translate to sl
    lblSeedInstrument:                      "Instrument",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to sl
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to sl
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to sl
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to sl
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to sl
    tabSeedRender:                          "Render", // TODO: translate to sl
    lblSeedKnobVolume:                      "Volume", // TODO: translate to sl
    lblSeedKnobOctave:                      "Octave", // TODO: translate to sl
    lblSeedKnobTune:                        "Tune", // TODO: translate to sl
    tipSeedMute:                            "Mute", // TODO: translate to sl
    tipSeedUnmute:                          "Unmute", // TODO: translate to sl
    lblSeedReverb:                          "Reverb", // TODO: translate to sl
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to sl
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to sl
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to sl
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to sl
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to sl
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to sl
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to sl
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to sl
    optSeedInstrumentSine:                  "Sinus: vgrajen sintetizator",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitna hitrost",
    lblSeedName:                            "Ime",
    lblSeedOutput:                          "Izhod",
    hntSeedOutput:                          "Osnovno ime upodobljenih datotek. Žetoni, zamenjani pri upodabljanju: {name}, {chords} (prvih 8 akordov), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Renderiraj seme",
    btnSeedPlay:                            "Predvajaj",
    btnSeedStop:                            "Ustavi",
    msgSeedPlayFailed:                      "Predvajanje ni uspelo",
    hntSeedRenderNeedsSave:                 "Najprej shranite seme v datoteko .yams — zvok se upodobi poleg nje.",
    tipSeedLoad:                            "Naloži seed",
    ttlSeedLoad:                            "Odpri seed datoteko",
    lblSeedLoadFilter:                      "Seed datoteka (.yams)",
    msgSeedLoadFailed:                      "Ni bilo mogoče naložiti te seed datoteke",
    tipSeedNew:                             "Novo seme",
    tipSeedTabClose:                        "Zapri",
    lblSeedUntitled:                        "Brez naslova",
    tipSeedSave:                            "Shrani seme",
    tipSeedSaveAs:                          "Shrani seme kot…",
    ttlSeedSaveAs:                          "Shrani seme kot",
    msgSeedSaveFailed:                      "Semena ni bilo mogoče shraniti",
    msgSeedDropHere:                        "Povlecite datoteko .yams seed za nalaganje",
    msgSeedBusy:                            "Upodabljanje…",
    msgSeedEmpty:                           "Najprej vnesite akordno progresijo.",
    msgSeedFailed:                          "Upodabljanje ni uspelo",
    lblSeedResult:                          "Shranjeno",
    hntSeedResult:                          "Naložite zvočno seme v Suno (Cover). Sledi harmoniji, ki jo sliši, ne imenom akordov, ki jih vnašate.",
    msgSeedBusyInstrument:                  "Nalaganje instrumenta…",
    msgSeedBusyRender:                      "Upodabljanje zvoka…",
    msgSeedBusySave:                        "Shranjevanje…",
    lblSeedSummaryChords:                   "Akordi",
    lblSeedSummaryDuration:                 "Trajanje",
    lblSeedSummarySize:                     "Oc. velikost",
    msgSeedSummaryInvalid:                  "Neprepoznano:",
    msgSeedSummarySigBad:                   "Neveljaven taktovski način",

  },

  ta: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "ரத்துசெய்",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "புதிய பதிப்பு உள்ளது:",
    lnkUpdateWhatsNew:                      "புதியது என்ன",
    btnUpdateDownload:                      "பதிவிறக்கு",
    lnkUpdateSkip:                          "இந்த பதிப்பைத் தவிர்க்கவும்",
    tipUpdateDismiss:                       "நிராகரி",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "அமைப்புகளைத் திற",
    tipHdrHelp:                             "உதவி",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "அமைப்புகள்",
    tabDlgSettingsDisplay:                  "காட்சி",
    tabDlgSettingsAbout:                    "பற்றி",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "மொழி",
    lblDlgSettingsDisplayTheme:             "தீம்",
    btnDlgSettingsDisplayThemeDark:         "இருண்ட",
    btnDlgSettingsDisplayThemeLight:        "வெளிச்சம்",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "சரம் முன்னேற்றங்களை ஆடியோ மற்றும் MIDI விதைகளாக உருவாக்குகிறது, இது Suno போன்ற AI இசை ஜெனரேட்டர்களைக் கட்டுப்படுத்துகிறது.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "சுரக்கோர்வை முன்னேற்றம்",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "ஒரு வரிக்கு ஒரு பட்டி: ஒவ்வொரு வரியும் சமமான நேரத்தைப் பெறுகிறது, மேலும் அதில் உள்ள நாண்கள் அந்த நேரத்தை சமமாகப் பிரிக்கின்றன (ஒரு வரியில் தனியாக ஒரு நாண் முழு பட்டியையும் வைத்திருக்கும்). [Section] குறிச்சொற்கள், வெற்று வரிகள் மற்றும் | குறிகள் புறக்கணிக்கப்படுகின்றன. ஸ்லாஷ் நாண்கள் (C/G), 7வது (Gmaj7) மற்றும் N.C. ஆதரிக்கப்படுகின்றன.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "வரிக்கு அளவுகள்",
    lblSeedSig:                             "நேரக் குறி",
    lblSeedLoops:                           "சுழல்கள்",
    lblSeedStyle:                           "நடை",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ta
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ta
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ta
    optSeedStylePad:                        "Pad", // TODO: translate to ta
    optSeedStyleDrone:                      "Drone", // TODO: translate to ta
    optSeedStyleMarker:                     "Marker", // TODO: translate to ta
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ta
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ta
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ta
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ta
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ta
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ta
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ta
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ta
    lblSeedInstrument:                      "கருவி",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ta
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ta
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ta
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ta
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ta
    tabSeedRender:                          "Render", // TODO: translate to ta
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ta
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ta
    lblSeedKnobTune:                        "Tune", // TODO: translate to ta
    tipSeedMute:                            "Mute", // TODO: translate to ta
    tipSeedUnmute:                          "Unmute", // TODO: translate to ta
    lblSeedReverb:                          "Reverb", // TODO: translate to ta
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ta
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ta
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ta
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ta
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ta
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ta
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ta
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ta
    optSeedInstrumentSine:                  "சைன்: உள்ளமைந்த சின்த்",
    lblSeedFormat:                          "வடிவம்",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 பிட்ரேட்",
    lblSeedName:                            "பெயர்",
    lblSeedOutput:                          "வெளியீடு",
    hntSeedOutput:                          "வழங்கப்பட்ட கோப்புகளின் அடிப்படைப் பெயர். வழங்குதலின்போது மாற்றப்படும் டோக்கன்கள்: {name}, {chords} (முதல் 8 நாண்கள்), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "சீடை ரெண்டர் செய்",
    btnSeedPlay:                            "இயக்கு",
    btnSeedStop:                            "நிறுத்து",
    msgSeedPlayFailed:                      "பின்னணி தோல்வியடைந்தது",
    hntSeedRenderNeedsSave:                 "முதலில் விதையை ஒரு .yams கோப்பில் சேமிக்கவும் — ஆடியோ அதற்கு அடுத்ததாக ரெண்டர் செய்யப்படும்.",
    tipSeedLoad:                            "சீட் ஏற்றவும்",
    ttlSeedLoad:                            "சீட் கோப்பை திறக்கவும்",
    lblSeedLoadFilter:                      "சீட் கோப்பு (.yams)",
    msgSeedLoadFailed:                      "அந்த சீட் கோப்பை ஏற்ற முடியவில்லை",
    tipSeedNew:                             "புதிய விதை",
    tipSeedTabClose:                        "மூடு",
    lblSeedUntitled:                        "தலைப்பற்றது",
    tipSeedSave:                            "சீட் சேமி",
    tipSeedSaveAs:                          "சீட்டை இவ்வாறு சேமி…",
    ttlSeedSaveAs:                          "சீட்டை இவ்வாறு சேமி",
    msgSeedSaveFailed:                      "சீட்டை சேமிக்க முடியவில்லை",
    msgSeedDropHere:                        ".yams விதை கோப்பை இங்கே இழுத்து விடவும்",
    msgSeedBusy:                            "ரெண்டரிங்…",
    msgSeedEmpty:                           "முதலில் ஒரு நாண் முன்னேற்றத்தை உள்ளிடவும்.",
    msgSeedFailed:                          "ரெண்டரிங் தோல்வியடைந்தது",
    lblSeedResult:                          "சேமிக்கப்பட்டது",
    hntSeedResult:                          "ஆடியோ சீடை Suno (Cover) இல் பதிவேற்றவும். இது நீங்கள் தட்டச்சு செய்யும் கார்டு பெயர்களைப் பின்பற்றாமல், அது கேட்கும் இணக்கத்தைப் பின்பற்றுகிறது.",
    msgSeedBusyInstrument:                  "கருவி ஏற்றப்படுகிறது…",
    msgSeedBusyRender:                      "ஆடியோ ரெண்டரிங்…",
    msgSeedBusySave:                        "சேமிக்கிறது…",
    lblSeedSummaryChords:                   "நாண்",
    lblSeedSummaryDuration:                 "கால அளவு",
    lblSeedSummarySize:                     "மதிப்பிடப்பட்ட அளவு",
    msgSeedSummaryInvalid:                  "அடையாளம் காணப்படவில்லை:",
    msgSeedSummarySigBad:                   "தவறான நேரக் குறிப்பு",

  },

  hi: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "रद्द करें",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "नया संस्करण उपलब्ध है:",
    lnkUpdateWhatsNew:                      "नया क्या है",
    btnUpdateDownload:                      "डाउनलोड करें",
    lnkUpdateSkip:                          "इस संस्करण को छोड़ें",
    tipUpdateDismiss:                       "खारिज करें",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "सेटिंग्स खोलें",
    tipHdrHelp:                             "सहायता",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "सेटिंग्स",
    tabDlgSettingsDisplay:                  "प्रदर्शन",
    tabDlgSettingsAbout:                    "के बारे में",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "भाषा",
    lblDlgSettingsDisplayTheme:             "थीम",
    btnDlgSettingsDisplayThemeDark:         "गहरा",
    btnDlgSettingsDisplayThemeLight:        "हल्का",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "कॉर्ड प्रोग्रेशन को ऑडियो और MIDI सीड्स के रूप में उत्पन्न करता है जो Suno जैसे AI संगीत जनरेटर को नियंत्रित करते हैं।",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "कॉर्ड प्रगति",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "प्रति पंक्ति एक बार: प्रत्येक पंक्ति को समान समय मिलता है, और उस पर मौजूद कॉर्ड उस समय को समान रूप से विभाजित करते हैं (एक पंक्ति पर अकेला कॉर्ड पूरे बार को रखता है)। [Section] टैग, खाली पंक्तियाँ और | चिह्न अनदेखा किए जाते हैं। स्लैश कॉर्ड (C/G), 7वें (Gmaj7) और N.C. समर्थित हैं।",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "प्रति पंक्ति माप",
    lblSeedSig:                             "समय हस्ताक्षर",
    lblSeedLoops:                           "लूप",
    lblSeedStyle:                           "शैली",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to hi
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to hi
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to hi
    optSeedStylePad:                        "Pad", // TODO: translate to hi
    optSeedStyleDrone:                      "Drone", // TODO: translate to hi
    optSeedStyleMarker:                     "Marker", // TODO: translate to hi
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to hi
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to hi
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to hi
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to hi
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to hi
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to hi
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to hi
    lblSeedKnobReverb:                      "reverb", // TODO: translate to hi
    lblSeedInstrument:                      "वाद्य यंत्र",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to hi
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to hi
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to hi
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to hi
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to hi
    tabSeedRender:                          "Render", // TODO: translate to hi
    lblSeedKnobVolume:                      "Volume", // TODO: translate to hi
    lblSeedKnobOctave:                      "Octave", // TODO: translate to hi
    lblSeedKnobTune:                        "Tune", // TODO: translate to hi
    tipSeedMute:                            "Mute", // TODO: translate to hi
    tipSeedUnmute:                          "Unmute", // TODO: translate to hi
    lblSeedReverb:                          "Reverb", // TODO: translate to hi
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to hi
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to hi
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to hi
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to hi
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to hi
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to hi
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to hi
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to hi
    optSeedInstrumentSine:                  "साइन: अंतर्निहित सिंथ",
    lblSeedFormat:                          "प्रारूप",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 बिटरेट",
    lblSeedName:                            "नाम",
    lblSeedOutput:                          "आउटपुट",
    hntSeedOutput:                          "रेंडर की गई फ़ाइलों का मूल नाम। रेंडर करते समय बदले गए टोकन: {name}, {chords} (पहले 8 कॉर्ड), {style}, {instrument}, {bpm}, {loops}।",
    btnSeedRender:                          "सीड रेंडर करें",
    btnSeedPlay:                            "चलाएँ",
    btnSeedStop:                            "रोकें",
    msgSeedPlayFailed:                      "प्लेबैक विफल रहा",
    hntSeedRenderNeedsSave:                 "पहले सीड को .yams फ़ाइल में सहेजें — ऑडियो उसके बगल में रेंडर किया जाता है।",
    tipSeedLoad:                            "सीड लोड करें",
    ttlSeedLoad:                            "सीड फ़ाइल खोलें",
    lblSeedLoadFilter:                      "सीड फ़ाइल (.yams)",
    msgSeedLoadFailed:                      "वह सीड फ़ाइल लोड नहीं हो सकी",
    tipSeedNew:                             "नया बीज",
    tipSeedTabClose:                        "बंद करें",
    lblSeedUntitled:                        "शीर्षकहीन",
    tipSeedSave:                            "बीज सहेजें",
    tipSeedSaveAs:                          "बीज को इस रूप में सहेजें…",
    ttlSeedSaveAs:                          "बीज को इस रूप में सहेजें",
    msgSeedSaveFailed:                      "बीज सहेजा नहीं जा सका",
    msgSeedDropHere:                        "इसे लोड करने के लिए एक .yams सीड फ़ाइल यहाँ छोड़ें",
    msgSeedBusy:                            "रेंडर हो रहा है…",
    msgSeedEmpty:                           "पहले एक कॉर्ड प्रोग्रेशन दर्ज करें।",
    msgSeedFailed:                          "रेंडर विफल रहा",
    lblSeedResult:                          "सहेजा गया",
    hntSeedResult:                          "ऑडियो सीड को Suno (कवर) पर अपलोड करें। यह आपके द्वारा टाइप किए गए कॉर्ड नामों के बजाय सुनी गई सद्भाव का पालन करता है।",
    msgSeedBusyInstrument:                  "उपकरण लोड हो रहा है…",
    msgSeedBusyRender:                      "ऑडियो रेंडर हो रहा है…",
    msgSeedBusySave:                        "सहेजा जा रहा है…",
    lblSeedSummaryChords:                   "कॉर्ड्स",
    lblSeedSummaryDuration:                 "अवधि",
    lblSeedSummarySize:                     "अनुमानित आकार",
    msgSeedSummaryInvalid:                  "अपरिचित:",
    msgSeedSummarySigBad:                   "अमान्य समय हस्ताक्षर",

  },

  bn: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "বাতিল করুন",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "নতুন সংস্করণ উপলব্ধ:",
    lnkUpdateWhatsNew:                      "নতুন কি আছে",
    btnUpdateDownload:                      "ডাউনলোড করুন",
    lnkUpdateSkip:                          "এই সংস্করণটি এড়িয়ে যান",
    tipUpdateDismiss:                       "খারিজ করুন",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "সেটিংস খুলুন",
    tipHdrHelp:                             "সাহায্য",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "সেটিংস",
    tabDlgSettingsDisplay:                  "প্রদর্শন",
    tabDlgSettingsAbout:                    "সম্পর্কে",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "ভাষা",
    lblDlgSettingsDisplayTheme:             "থিম",
    btnDlgSettingsDisplayThemeDark:         "গাঢ়",
    btnDlgSettingsDisplayThemeLight:        "হালকা",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "কর্ড প্রগ্রেশনকে অডিও এবং MIDI বীজ হিসেবে তৈরি করে যা Suno-এর মতো AI সঙ্গীত জেনারেটরকে সীমাবদ্ধ করে।",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "কর্ড প্রগ্ৰেশন",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "প্রতি লাইনে একটি বার: প্রতিটি লাইন সমান সময় পায়, এবং এর উপর থাকা কর্ডগুলি সেই সময়কে সমানভাবে ভাগ করে (একটি লাইনে একা একটি কর্ড পুরো বারটি ধরে রাখে)। [Section] ট্যাগ, খালি লাইন এবং | চিহ্নগুলি উপেক্ষা করা হয়। স্ল্যাশ কর্ড (C/G), 7ম (Gmaj7) এবং N.C. সমর্থিত।",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "প্রতি লাইনে পরিমাপ",
    lblSeedSig:                             "সময় স্বাক্ষর",
    lblSeedLoops:                           "লুপ",
    lblSeedStyle:                           "শৈলী",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to bn
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to bn
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to bn
    optSeedStylePad:                        "Pad", // TODO: translate to bn
    optSeedStyleDrone:                      "Drone", // TODO: translate to bn
    optSeedStyleMarker:                     "Marker", // TODO: translate to bn
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to bn
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to bn
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to bn
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to bn
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to bn
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to bn
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to bn
    lblSeedKnobReverb:                      "reverb", // TODO: translate to bn
    lblSeedInstrument:                      "যন্ত্র",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to bn
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to bn
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to bn
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to bn
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to bn
    tabSeedRender:                          "Render", // TODO: translate to bn
    lblSeedKnobVolume:                      "Volume", // TODO: translate to bn
    lblSeedKnobOctave:                      "Octave", // TODO: translate to bn
    lblSeedKnobTune:                        "Tune", // TODO: translate to bn
    tipSeedMute:                            "Mute", // TODO: translate to bn
    tipSeedUnmute:                          "Unmute", // TODO: translate to bn
    lblSeedReverb:                          "Reverb", // TODO: translate to bn
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to bn
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to bn
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to bn
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to bn
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to bn
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to bn
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to bn
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to bn
    optSeedInstrumentSine:                  "সাইন: বিল্ট-ইন সিন্থ",
    lblSeedFormat:                          "বিন্যাস",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 বিটরেট",
    lblSeedName:                            "নাম",
    lblSeedOutput:                          "আউটপুট",
    hntSeedOutput:                          "রেন্ডার করা ফাইলগুলির মূল নাম। রেন্ডার করার সময় প্রতিস্থাপিত টোকেন: {name}, {chords} (প্রথম 8টি কর্ড), {style}, {instrument}, {bpm}, {loops}।",
    btnSeedRender:                          "সিড রেন্ডার করুন",
    btnSeedPlay:                            "চালান",
    btnSeedStop:                            "থামান",
    msgSeedPlayFailed:                      "প্লেব্যাক ব্যর্থ হয়েছে",
    hntSeedRenderNeedsSave:                 "প্রথমে সিডটি একটি .yams ফাইলে সংরক্ষণ করুন — অডিও এর পাশে রেন্ডার করা হয়।",
    tipSeedLoad:                            "সিড লোড করুন",
    ttlSeedLoad:                            "সিড ফাইল খুলুন",
    lblSeedLoadFilter:                      "সিড ফাইল (.yams)",
    msgSeedLoadFailed:                      "সেই সিড ফাইল লোড করা যায়নি",
    tipSeedNew:                             "নতুন বীজ",
    tipSeedTabClose:                        "বন্ধ করুন",
    lblSeedUntitled:                        "শিরোনামহীন",
    tipSeedSave:                            "বীজ সংরক্ষণ করুন",
    tipSeedSaveAs:                          "বীজ হিসাবে সংরক্ষণ করুন…",
    ttlSeedSaveAs:                          "বীজ হিসাবে সংরক্ষণ করুন",
    msgSeedSaveFailed:                      "বীজ সংরক্ষণ করা যায়নি",
    msgSeedDropHere:                        "লোড করার জন্য একটি .yams সিড ফাইল এখানে ফেলুন",
    msgSeedBusy:                            "রেন্ডারিং হচ্ছে…",
    msgSeedEmpty:                           "প্রথমে একটি কর্ড প্রগ্রেশন লিখুন।",
    msgSeedFailed:                          "রেন্ডার ব্যর্থ হয়েছে",
    lblSeedResult:                          "সংরক্ষিত",
    hntSeedResult:                          "Suno (কভার)-এ অডিও সিড আপলোড করুন। এটি আপনার টাইপ করা কর্ডের নাম নয়, বরং শোনা সুর অনুসরণ করে।",
    msgSeedBusyInstrument:                  "যন্ত্র লোড হচ্ছে…",
    msgSeedBusyRender:                      "অডিও রেন্ডার হচ্ছে…",
    msgSeedBusySave:                        "সংরক্ষণ করা হচ্ছে…",
    lblSeedSummaryChords:                   "কর্ড",
    lblSeedSummaryDuration:                 "সময়কাল",
    lblSeedSummarySize:                     "আনুমানিক আকার",
    msgSeedSummaryInvalid:                  "অচেনা:",
    msgSeedSummarySigBad:                   "অবৈধ সময় স্বাক্ষর",

  },

  ur: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "منسوخ کریں",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "نیا ورژن دستیاب ہے:",
    lnkUpdateWhatsNew:                      "نیا کیا ہے",
    btnUpdateDownload:                      "ڈاؤن لوڈ کریں",
    lnkUpdateSkip:                          "اس ورژن کو چھوڑ دیں",
    tipUpdateDismiss:                       "مسترد کریں",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "ترتیبات کھولیں",
    tipHdrHelp:                             "مدد",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "ترتیبات",
    tabDlgSettingsDisplay:                  "ڈسپلے",
    tabDlgSettingsAbout:                    "کے بارے میں",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "زبان",
    lblDlgSettingsDisplayTheme:             "تھیم",
    btnDlgSettingsDisplayThemeDark:         "گہرا",
    btnDlgSettingsDisplayThemeLight:        "ہلکا",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "کورد پروگریشنز کو آڈیو اور MIDI سیڈز کے طور پر تیار کرتا ہے جو Suno جیسے AI میوزک جنریٹرز کو محدود کرتے ہیں۔",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "کورد کی ترقی",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "ہر لائن پر ایک بار: ہر لائن کو برابر وقت ملتا ہے، اور اس پر موجود راگ اس وقت کو یکساں طور پر تقسیم کرتے ہیں (ایک لائن پر اکیلا راگ پورے بار کو رکھتا ہے)۔ [Section] ٹیگز، خالی لائنیں اور | نشانات نظر انداز کیے جاتے ہیں۔ سلیش راگ (C/G)، 7ویں (Gmaj7) اور N.C. کی حمایت کی جاتی ہے۔",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "فی لائن پیمائش",
    lblSeedSig:                             "وقت کا نشان",
    lblSeedLoops:                           "لوپس",
    lblSeedStyle:                           "انداز",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ur
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ur
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ur
    optSeedStylePad:                        "Pad", // TODO: translate to ur
    optSeedStyleDrone:                      "Drone", // TODO: translate to ur
    optSeedStyleMarker:                     "Marker", // TODO: translate to ur
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ur
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ur
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ur
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ur
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ur
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ur
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ur
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ur
    lblSeedInstrument:                      "آلہ",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ur
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ur
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ur
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ur
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ur
    tabSeedRender:                          "Render", // TODO: translate to ur
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ur
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ur
    lblSeedKnobTune:                        "Tune", // TODO: translate to ur
    tipSeedMute:                            "Mute", // TODO: translate to ur
    tipSeedUnmute:                          "Unmute", // TODO: translate to ur
    lblSeedReverb:                          "Reverb", // TODO: translate to ur
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ur
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ur
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ur
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ur
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ur
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ur
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ur
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ur
    optSeedInstrumentSine:                  "سائن: بلٹ ان سنتھ",
    lblSeedFormat:                          "فارمیٹ",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 بٹ ریٹ",
    lblSeedName:                            "نام",
    lblSeedOutput:                          "آؤٹ پٹ",
    hntSeedOutput:                          "ریندر شدہ فائلوں کا بنیادی نام۔ رینڈر کرتے وقت تبدیل کیے گئے ٹوکن: {name}, {chords} (پہلے 8 راگ), {style}, {instrument}, {bpm}, {loops}۔",
    btnSeedRender:                          "سیڈ رینڈر کریں",
    btnSeedPlay:                            "چلائیں",
    btnSeedStop:                            "روکیں",
    msgSeedPlayFailed:                      "پلے بیک ناکام ہو گیا",
    hntSeedRenderNeedsSave:                 "پہلے سیڈ کو .yams فائل میں محفوظ کریں — آڈیو اس کے ساتھ رینڈر کیا جاتا ہے۔",
    tipSeedLoad:                            "سیڈ لوڈ کریں",
    ttlSeedLoad:                            "سیڈ فائل کھولیں",
    lblSeedLoadFilter:                      "سیڈ فائل (.yams)",
    msgSeedLoadFailed:                      "وہ سیڈ فائل لوڈ نہیں ہو سکی",
    tipSeedNew:                             "نیا بیج",
    tipSeedTabClose:                        "بند کریں",
    lblSeedUntitled:                        "بے عنوان",
    tipSeedSave:                            "بیج محفوظ کریں",
    tipSeedSaveAs:                          "بیج کو بطور محفوظ کریں…",
    ttlSeedSaveAs:                          "بیج کو بطور محفوظ کریں",
    msgSeedSaveFailed:                      "بیج محفوظ نہیں کیا جا سکا",
    msgSeedDropHere:                        "اسے لوڈ کرنے کے لیے ایک .yams سیڈ فائل یہاں ڈراپ کریں",
    msgSeedBusy:                            "رینڈر ہو رہا ہے…",
    msgSeedEmpty:                           "پہلے ایک راگ کی ترتیب درج کریں۔",
    msgSeedFailed:                          "رینڈر ناکام ہو گیا",
    lblSeedResult:                          "محفوظ ہو گیا",
    hntSeedResult:                          "آڈیو سیڈ کو Suno (کور) پر اپ لوڈ کریں۔ یہ آپ کے ٹائپ کردہ راگ کے ناموں کے بجائے سنی ہوئی ہم آہنگی کی پیروی کرتا ہے۔",
    msgSeedBusyInstrument:                  "آلہ لوڈ ہو رہا ہے…",
    msgSeedBusyRender:                      "آڈیو رینڈر ہو رہا ہے…",
    msgSeedBusySave:                        "محفوظ کیا جا رہا ہے…",
    lblSeedSummaryChords:                   "راگ",
    lblSeedSummaryDuration:                 "مدت",
    lblSeedSummarySize:                     "تخمینی سائز",
    msgSeedSummaryInvalid:                  "ناقابل شناخت:",
    msgSeedSummarySigBad:                   "غلط وقت کا دستخط",

  },

  sw: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Ghairi",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Toleo jipya linapatikana:",
    lnkUpdateWhatsNew:                      "Nini kipya",
    btnUpdateDownload:                      "Pakua",
    lnkUpdateSkip:                          "Ruka toleo hili",
    tipUpdateDismiss:                       "Futa",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Fungua mipangilio",
    tipHdrHelp:                             "Msaada",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Mipangilio",
    tabDlgSettingsDisplay:                  "Onyesho",
    tabDlgSettingsAbout:                    "Kuhusu",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Lugha",
    lblDlgSettingsDisplayTheme:             "Mandhari",
    btnDlgSettingsDisplayThemeDark:         "Giza",
    btnDlgSettingsDisplayThemeLight:        "Nuru",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Hutengeneza maendeleo ya nyimbo kama mbegu za sauti + MIDI zinazoweka mipaka kwa jenereta za muziki za AI kama Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Mfuatano wa kodi",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Ba moja kwa kila mstari: kila mstari hupata muda sawa, na nyimbo zake hugawanya muda huo sawasawa (wimbo mmoja pekee kwenye mstari hushikilia ba nzima). Vitambulisho vya [Section], mistari tupu na alama za | hupuuzwa. Nyimbo za slash (C/G), 7ths (Gmaj7) na N.C. zinaungwa mkono.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Mizani kwa mstari",
    lblSeedSig:                             "Saini ya muda",
    lblSeedLoops:                           "Mizunguko",
    lblSeedStyle:                           "Mtindo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to sw
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to sw
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to sw
    optSeedStylePad:                        "Pad", // TODO: translate to sw
    optSeedStyleDrone:                      "Drone", // TODO: translate to sw
    optSeedStyleMarker:                     "Marker", // TODO: translate to sw
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to sw
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to sw
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to sw
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to sw
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to sw
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to sw
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to sw
    lblSeedKnobReverb:                      "reverb", // TODO: translate to sw
    lblSeedInstrument:                      "Ala",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to sw
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to sw
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to sw
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to sw
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to sw
    tabSeedRender:                          "Render", // TODO: translate to sw
    lblSeedKnobVolume:                      "Volume", // TODO: translate to sw
    lblSeedKnobOctave:                      "Octave", // TODO: translate to sw
    lblSeedKnobTune:                        "Tune", // TODO: translate to sw
    tipSeedMute:                            "Mute", // TODO: translate to sw
    tipSeedUnmute:                          "Unmute", // TODO: translate to sw
    lblSeedReverb:                          "Reverb", // TODO: translate to sw
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to sw
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to sw
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to sw
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to sw
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to sw
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to sw
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to sw
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to sw
    optSeedInstrumentSine:                  "Saini: synth iliyojengwa ndani",
    lblSeedFormat:                          "Umbizo",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Kiwango cha biti cha MP3",
    lblSeedName:                            "Jina",
    lblSeedOutput:                          "Pato",
    hntSeedOutput:                          "Jina la msingi la faili zilizotolewa. Tokeni zilizobadilishwa wakati wa kutoa: {name}, {chords} (nyimbo 8 za kwanza), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Toa mbegu",
    btnSeedPlay:                            "Cheza",
    btnSeedStop:                            "Simamisha",
    msgSeedPlayFailed:                      "Uchezaji umeshindwa",
    hntSeedRenderNeedsSave:                 "Hifadhi seed kwenye faili ya .yams kwanza — sauti inatolewa karibu nayo.",
    tipSeedLoad:                            "Pakia mbegu",
    ttlSeedLoad:                            "Fungua faili la mbegu",
    lblSeedLoadFilter:                      "Faili la mbegu (.yams)",
    msgSeedLoadFailed:                      "Imeshindwa kupakia faili hilo la mbegu",
    tipSeedNew:                             "Mbegu mpya",
    tipSeedTabClose:                        "Funga",
    lblSeedUntitled:                        "Isiyo na kichwa",
    tipSeedSave:                            "Hifadhi mbegu",
    tipSeedSaveAs:                          "Hifadhi mbegu kama…",
    ttlSeedSaveAs:                          "Hifadhi mbegu kama",
    msgSeedSaveFailed:                      "Imeshindwa kuhifadhi mbegu",
    msgSeedDropHere:                        "Buruta faili ya .yams seed ili kuipakia",
    msgSeedBusy:                            "Inatengeneza…",
    msgSeedEmpty:                           "Ingiza mfuatano wa akodi kwanza.",
    msgSeedFailed:                          "Utengenezaji umeshindwa",
    lblSeedResult:                          "Imehifadhiwa",
    hntSeedResult:                          "Pakia mbegu ya sauti kwa Suno (Cover). Inafuata upatanifu inayosikia, si majina ya akodi unayoandika.",
    msgSeedBusyInstrument:                  "Inapakia ala…",
    msgSeedBusyRender:                      "Inatoa sauti…",
    msgSeedBusySave:                        "Inahifadhi…",
    lblSeedSummaryChords:                   "Akodi",
    lblSeedSummaryDuration:                 "Muda",
    lblSeedSummarySize:                     "Ukubwa uliokadiriwa",
    msgSeedSummaryInvalid:                  "Haijatambulika:",
    msgSeedSummarySigBad:                   "Sahihi ya muda batili",

  },

  pa: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "ਰੱਦ ਕਰੋ",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "ਨਵਾਂ ਸੰਸਕਰਨ ਉਪਲਬਧ ਹੈ:",
    lnkUpdateWhatsNew:                      "ਨਵਾਂ ਕੀ ਹੈ",
    btnUpdateDownload:                      "ਡਾਊਨਲੋਡ ਕਰੋ",
    lnkUpdateSkip:                          "ਇਸ ਸੰਸਕਰਨ ਨੂੰ ਛੱਡੋ",
    tipUpdateDismiss:                       "ਖਾਰਜ ਕਰੋ",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "ਸੈਟਿੰਗਾਂ ਖੋਲ੍ਹੋ",
    tipHdrHelp:                             "ਮਦਦ",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "ਸੈਟਿੰਗਾਂ",
    tabDlgSettingsDisplay:                  "ਪ੍ਰਦਰਸ਼ਨ",
    tabDlgSettingsAbout:                    "ਬਾਰੇ",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "ਭਾਸ਼ਾ",
    lblDlgSettingsDisplayTheme:             "ਥੀਮ",
    btnDlgSettingsDisplayThemeDark:         "ਗੂੜ੍ਹਾ",
    btnDlgSettingsDisplayThemeLight:        "ਹਲਕਾ",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "ਕੋਰਡ ਪ੍ਰੋਗਰੈਸ਼ਨਾਂ ਨੂੰ ਆਡੀਓ ਅਤੇ MIDI ਬੀਜਾਂ ਵਜੋਂ ਤਿਆਰ ਕਰਦਾ ਹੈ ਜੋ Suno ਵਰਗੇ AI ਸੰਗੀਤ ਜਨਰੇਟਰਾਂ ਨੂੰ ਸੀਮਤ ਕਰਦੇ ਹਨ।",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "ਕੋਰਡ ਪ੍ਰਗਤੀ",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "ਪ੍ਰਤੀ ਲਾਈਨ ਇੱਕ ਬਾਰ: ਹਰੇਕ ਲਾਈਨ ਨੂੰ ਬਰਾਬਰ ਸਮਾਂ ਮਿਲਦਾ ਹੈ, ਅਤੇ ਇਸ 'ਤੇ ਮੌਜੂਦ ਕੋਰਡ ਉਸ ਸਮੇਂ ਨੂੰ ਬਰਾਬਰ ਵੰਡਦੇ ਹਨ (ਇੱਕ ਲਾਈਨ 'ਤੇ ਇਕੱਲਾ ਕੋਰਡ ਪੂਰੀ ਬਾਰ ਨੂੰ ਰੱਖਦਾ ਹੈ)। [Section] ਟੈਗ, ਖਾਲੀ ਲਾਈਨਾਂ ਅਤੇ | ਨਿਸ਼ਾਨ ਅਣਡਿੱਠ ਕੀਤੇ ਜਾਂਦੇ ਹਨ। ਸਲੈਸ਼ ਕੋਰਡ (C/G), 7ਵੇਂ (Gmaj7) ਅਤੇ N.C. ਸਮਰਥਿਤ ਹਨ।",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "ਪ੍ਰਤੀ ਲਾਈਨ ਮਾਪ",
    lblSeedSig:                             "ਸਮਾਂ ਦਸਤਖਤ",
    lblSeedLoops:                           "ਲੂਪਸ",
    lblSeedStyle:                           "ਸ਼ੈਲੀ",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to pa
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to pa
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to pa
    optSeedStylePad:                        "Pad", // TODO: translate to pa
    optSeedStyleDrone:                      "Drone", // TODO: translate to pa
    optSeedStyleMarker:                     "Marker", // TODO: translate to pa
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to pa
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to pa
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to pa
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to pa
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to pa
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to pa
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to pa
    lblSeedKnobReverb:                      "reverb", // TODO: translate to pa
    lblSeedInstrument:                      "ਸਾਜ਼",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to pa
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to pa
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to pa
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to pa
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to pa
    tabSeedRender:                          "Render", // TODO: translate to pa
    lblSeedKnobVolume:                      "Volume", // TODO: translate to pa
    lblSeedKnobOctave:                      "Octave", // TODO: translate to pa
    lblSeedKnobTune:                        "Tune", // TODO: translate to pa
    tipSeedMute:                            "Mute", // TODO: translate to pa
    tipSeedUnmute:                          "Unmute", // TODO: translate to pa
    lblSeedReverb:                          "Reverb", // TODO: translate to pa
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to pa
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to pa
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to pa
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to pa
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to pa
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to pa
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to pa
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to pa
    optSeedInstrumentSine:                  "ਸਾਈਨ: ਬਿਲਟ-ਇਨ ਸਿੰਥ",
    lblSeedFormat:                          "ਫਾਰਮੈਟ",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 ਬਿੱਟਰੇਟ",
    lblSeedName:                            "ਨਾਮ",
    lblSeedOutput:                          "ਆਉਟਪੁੱਟ",
    hntSeedOutput:                          "ਰੈਂਡਰ ਕੀਤੀਆਂ ਫਾਈਲਾਂ ਦਾ ਮੂਲ ਨਾਮ। ਰੈਂਡਰ ਕਰਨ ਵੇਲੇ ਬਦਲੇ ਗਏ ਟੋਕਨ: {name}, {chords} (ਪਹਿਲੇ 8 ਕੋਰਡ), {style}, {instrument}, {bpm}, {loops}।",
    btnSeedRender:                          "ਸੀਡ ਰੈਂਡਰ ਕਰੋ",
    btnSeedPlay:                            "ਚਲਾਓ",
    btnSeedStop:                            "ਰੋਕੋ",
    msgSeedPlayFailed:                      "ਪਲੇਬੈਕ ਅਸਫਲ ਰਿਹਾ",
    hntSeedRenderNeedsSave:                 "ਪਹਿਲਾਂ ਸੀਡ ਨੂੰ .yams ਫਾਈਲ ਵਿੱਚ ਸੇਵ ਕਰੋ — ਆਡੀਓ ਇਸਦੇ ਨਾਲ ਰੈਂਡਰ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    tipSeedLoad:                            "ਸੀਡ ਲੋਡ ਕਰੋ",
    ttlSeedLoad:                            "ਸੀਡ ਫਾਈਲ ਖੋਲ੍ਹੋ",
    lblSeedLoadFilter:                      "ਸੀਡ ਫਾਈਲ (.yams)",
    msgSeedLoadFailed:                      "ਉਹ ਸੀਡ ਫਾਈਲ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ",
    tipSeedNew:                             "ਨਵਾਂ ਬੀਜ",
    tipSeedTabClose:                        "ਬੰਦ ਕਰੋ",
    lblSeedUntitled:                        "ਬੇਨਾਮ",
    tipSeedSave:                            "ਬੀਜ ਸੁਰੱਖਿਅਤ ਕਰੋ",
    tipSeedSaveAs:                          "ਬੀਜ ਨੂੰ ਇਸ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ ਕਰੋ…",
    ttlSeedSaveAs:                          "ਬੀਜ ਨੂੰ ਇਸ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ ਕਰੋ",
    msgSeedSaveFailed:                      "ਬੀਜ ਸੁਰੱਖਿਅਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ",
    msgSeedDropHere:                        "ਇਸਨੂੰ ਲੋਡ ਕਰਨ ਲਈ ਇੱਕ .yams ਸੀਡ ਫਾਈਲ ਇੱਥੇ ਸੁੱਟੋ",
    msgSeedBusy:                            "ਰੈਂਡਰ ਹੋ ਰਿਹਾ ਹੈ…",
    msgSeedEmpty:                           "ਪਹਿਲਾਂ ਇੱਕ ਕੋਰਡ ਪ੍ਰੋਗਰੈਸ਼ਨ ਦਾਖਲ ਕਰੋ।",
    msgSeedFailed:                          "ਰੈਂਡਰ ਅਸਫਲ ਰਿਹਾ",
    lblSeedResult:                          "ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਗਿਆ",
    hntSeedResult:                          "ਆਡੀਓ ਸੀਡ ਨੂੰ Suno (ਕਵਰ) 'ਤੇ ਅੱਪਲੋਡ ਕਰੋ। ਇਹ ਤੁਹਾਡੇ ਦੁਆਰਾ ਟਾਈਪ ਕੀਤੇ ਗਏ ਕੋਰਡ ਨਾਮਾਂ ਦੀ ਬਜਾਏ ਸੁਣੀ ਗਈ ਸੁਰ ਦਾ ਪਾਲਣ ਕਰਦਾ ਹੈ।",
    msgSeedBusyInstrument:                  "ਸਾਜ਼ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    msgSeedBusyRender:                      "ਆਡੀਓ ਰੈਂਡਰ ਹੋ ਰਿਹਾ ਹੈ…",
    msgSeedBusySave:                        "ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…",
    lblSeedSummaryChords:                   "ਕੋਰਡ",
    lblSeedSummaryDuration:                 "ਮਿਆਦ",
    lblSeedSummarySize:                     "ਅਨੁਮਾਨਿਤ ਆਕਾਰ",
    msgSeedSummaryInvalid:                  "ਅਣਪਛਾਤਾ:",
    msgSeedSummarySigBad:                   "ਅਵੈਧ ਸਮਾਂ ਦਸਤਖਤ",

  },

  ha: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Soke",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Sabon sigar yana nan:",
    lnkUpdateWhatsNew:                      "Menene sabo",
    btnUpdateDownload:                      "Zazzage",
    lnkUpdateSkip:                          "Tsallake wannan sigar",
    tipUpdateDismiss:                       "Watsar",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Bude saituna",
    tipHdrHelp:                             "Taimako",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Saituna",
    tabDlgSettingsDisplay:                  "Nuni",
    tabDlgSettingsAbout:                    "Game da",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Harshe",
    lblDlgSettingsDisplayTheme:             "Jigo",
    btnDlgSettingsDisplayThemeDark:         "Duhu",
    btnDlgSettingsDisplayThemeLight:        "Haske",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Yana samar da ci gaban kida zuwa tsaba na sauti da MIDI waɗanda ke takura masu samar da kiɗa na AI kamar Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Ci gaban kodi",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Ma'auni ɗaya a kowane layi: kowane layi yana samun lokaci daidai, kuma kordoji a kai suna raba lokacin daidai (kordo ɗaya kaɗai a layi yana riƙe da ma'aunin gaba ɗaya). Ana watsi da alamomin [Section], layukan fanko da alamomin |. Ana tallafawa kordojin slash (C/G), 7ths (Gmaj7) da N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Ma'auni a kowane layi",
    lblSeedSig:                             "Sa hannun lokaci",
    lblSeedLoops:                           "Madauki",
    lblSeedStyle:                           "Salo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to ha
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to ha
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to ha
    optSeedStylePad:                        "Pad", // TODO: translate to ha
    optSeedStyleDrone:                      "Drone", // TODO: translate to ha
    optSeedStyleMarker:                     "Marker", // TODO: translate to ha
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to ha
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to ha
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to ha
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to ha
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to ha
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to ha
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to ha
    lblSeedKnobReverb:                      "reverb", // TODO: translate to ha
    lblSeedInstrument:                      "Kayan aiki",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to ha
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to ha
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to ha
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to ha
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to ha
    tabSeedRender:                          "Render", // TODO: translate to ha
    lblSeedKnobVolume:                      "Volume", // TODO: translate to ha
    lblSeedKnobOctave:                      "Octave", // TODO: translate to ha
    lblSeedKnobTune:                        "Tune", // TODO: translate to ha
    tipSeedMute:                            "Mute", // TODO: translate to ha
    tipSeedUnmute:                          "Unmute", // TODO: translate to ha
    lblSeedReverb:                          "Reverb", // TODO: translate to ha
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to ha
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to ha
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to ha
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to ha
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to ha
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to ha
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to ha
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to ha
    optSeedInstrumentSine:                  "Sine: ginshigar synth",
    lblSeedFormat:                          "Tsari",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitrate",
    lblSeedName:                            "Suna",
    lblSeedOutput:                          "Fitarwa",
    hntSeedOutput:                          "Sunan tushe na fayilolin da aka yi. Alamomin da aka maye gurbinsu yayin yin: {name}, {chords} (maɓallan 8 na farko), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Render iri",
    btnSeedPlay:                            "Kunna",
    btnSeedStop:                            "Tsaya",
    msgSeedPlayFailed:                      "Kunna ya gaza",
    hntSeedRenderNeedsSave:                 "Ajiye seed zuwa fayil ɗin .yams da farko — ana fitar da sauti kusa da shi.",
    tipSeedLoad:                            "Ɗauki iri",
    ttlSeedLoad:                            "Bude fayil ɗin iri",
    lblSeedLoadFilter:                      "Fayil ɗin iri (.yams)",
    msgSeedLoadFailed:                      "Ba a iya ɗaukar wannan fayil ɗin iri ba",
    tipSeedNew:                             "Sabon iri",
    tipSeedTabClose:                        "Rufe",
    lblSeedUntitled:                        "Ba tare da take ba",
    tipSeedSave:                            "Ajiye iri",
    tipSeedSaveAs:                          "Ajiye iri a matsayin…",
    ttlSeedSaveAs:                          "Ajiye iri a matsayin",
    msgSeedSaveFailed:                      "Ba a iya ajiye iri ba",
    msgSeedDropHere:                        "Jawo fayil ɗin .yams seed don loda shi",
    msgSeedBusy:                            "Ana sarrafawa…",
    msgSeedEmpty:                           "Fara shigar da ci gaban kirtani.",
    msgSeedFailed:                          "Sarrafawa ya gaza",
    lblSeedResult:                          "An adana",
    hntSeedResult:                          "Loda 'audio seed' zuwa Suno (Cover). Yana bin jituwar da yake ji, ba sunayen kirtani da kake rubutawa ba.",
    msgSeedBusyInstrument:                  "Ana ɗora kayan kiɗa…",
    msgSeedBusyRender:                      "Ana fitar da sauti…",
    msgSeedBusySave:                        "Ana adanawa…",
    lblSeedSummaryChords:                   "Kordoji",
    lblSeedSummaryDuration:                 "Tsawon lokaci",
    lblSeedSummarySize:                     "Girman da aka kiyasta",
    msgSeedSummaryInvalid:                  "Ba a gane ba:",
    msgSeedSummarySigBad:                   "Sa hannun lokaci mara inganci",

  },

  yo: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Fagilee",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "Ẹya tuntun wa:",
    lnkUpdateWhatsNew:                      "Kí ni titun",
    btnUpdateDownload:                      "Ṣe igbasilẹ",
    lnkUpdateSkip:                          "Fo ẹya yii",
    tipUpdateDismiss:                       "Foju pa",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Ṣi eto",
    tipHdrHelp:                             "Iranlọwọ",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Eto",
    tabDlgSettingsDisplay:                  "Ifihan",
    tabDlgSettingsAbout:                    "Nipa",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Èdè",
    lblDlgSettingsDisplayTheme:             "Àtùpà",
    btnDlgSettingsDisplayThemeDark:         "Dudu",
    btnDlgSettingsDisplayThemeLight:        "Fẹ́lẹ́fẹ́lẹ́",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "N ṣe ipilẹṣẹ ilọsiwaju akọọlẹ bi awọn irugbin ohun + MIDI ti o fi ipa mu awọn olupilẹṣẹ orin AI bi Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Ìtẹ̀síwájú Kọ́ọ̀dù",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Ọkan bar fun ila kọọkan: ila kọọkan n gba akoko dọgba, ati awọn kọọdu lori rẹ pin akoko naa dọgba (kọọdu kan ṣoṣo lori ila kan n mu gbogbo bar naa). Awọn ami [Section], awọn ila ofo ati awọn ami | ni a ko kà si. Awọn kọọdu slash (C/G), 7ths (Gmaj7) ati N.C. ni atilẹyin.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Àwọn ìwọ̀n fún ìlà kọ̀ọ̀kan",
    lblSeedSig:                             "Ami akoko",
    lblSeedLoops:                           "Awọn lupu",
    lblSeedStyle:                           "Ara",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to yo
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to yo
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to yo
    optSeedStylePad:                        "Pad", // TODO: translate to yo
    optSeedStyleDrone:                      "Drone", // TODO: translate to yo
    optSeedStyleMarker:                     "Marker", // TODO: translate to yo
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to yo
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to yo
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to yo
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to yo
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to yo
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to yo
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to yo
    lblSeedKnobReverb:                      "reverb", // TODO: translate to yo
    lblSeedInstrument:                      "Ohun èlò",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to yo
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to yo
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to yo
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to yo
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to yo
    tabSeedRender:                          "Render", // TODO: translate to yo
    lblSeedKnobVolume:                      "Volume", // TODO: translate to yo
    lblSeedKnobOctave:                      "Octave", // TODO: translate to yo
    lblSeedKnobTune:                        "Tune", // TODO: translate to yo
    tipSeedMute:                            "Mute", // TODO: translate to yo
    tipSeedUnmute:                          "Unmute", // TODO: translate to yo
    lblSeedReverb:                          "Reverb", // TODO: translate to yo
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to yo
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to yo
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to yo
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to yo
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to yo
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to yo
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to yo
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to yo
    optSeedInstrumentSine:                  "Sine: sintetiki ti a kọ sinu",
    lblSeedFormat:                          "Ọna kika",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "Oṣuwọn bit MP3",
    lblSeedName:                            "Orukọ",
    lblSeedOutput:                          "Ìjáde",
    hntSeedOutput:                          "Orukọ ipilẹ awọn faili ti a ti ṣe. Awọn ami ti a rọpo nigba ṣiṣe: {name}, {chords} (awọn akọọlẹ 8 akọkọ), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "Render irugbin",
    btnSeedPlay:                            "Ṣiṣẹ",
    btnSeedStop:                            "Duro",
    msgSeedPlayFailed:                      "Ikuna ṣiṣẹ",
    hntSeedRenderNeedsSave:                 "Kọkọ fipamọ irugbin naa si faili .yams — ohun yoo jẹ dida lẹgbẹẹ rẹ.",
    tipSeedLoad:                            "Ṣe ìgbékalẹ̀ irúgbìn",
    ttlSeedLoad:                            "Ṣí faili irúgbìn",
    lblSeedLoadFilter:                      "Faili irúgbìn (.yams)",
    msgSeedLoadFailed:                      "Kò lè ṣe ìgbékalẹ̀ faili irúgbìn yẹn",
    tipSeedNew:                             "Irugbin titun",
    tipSeedTabClose:                        "Pa",
    lblSeedUntitled:                        "Laisi akọle",
    tipSeedSave:                            "Fipamọ irugbin",
    tipSeedSaveAs:                          "Fipamọ irugbin bi…",
    ttlSeedSaveAs:                          "Fipamọ irugbin bi",
    msgSeedSaveFailed:                      "Ko le fipamọ irugbin",
    msgSeedDropHere:                        "Fa faili irugbin .yams kan silẹ lati gbe e",
    msgSeedBusy:                            "Nṣe afihan…",
    msgSeedEmpty:                           "Kọkọ tẹ ilọsiwaju kọọdu sii.",
    msgSeedFailed:                          "Ifihan kuna",
    lblSeedResult:                          "Ti fipamọ",
    hntSeedResult:                          "Po irugbin ohun si Suno (Ideri). O tẹle isokan ti o gbọ, kii ṣe awọn orukọ akọọlẹ ti o tẹ.",
    msgSeedBusyInstrument:                  "Nṣe ikojọpọ ohun èlò…",
    msgSeedBusyRender:                      "Ńṣe ìtumọ̀ ohùn…",
    msgSeedBusySave:                        "Ńfi pamọ́…",
    lblSeedSummaryChords:                   "Kọ́ọ̀dù",
    lblSeedSummaryDuration:                 "Àkókò",
    lblSeedSummarySize:                     "Ìwọ̀n tí a fojú díwọ̀n",
    msgSeedSummaryInvalid:                  "Kò mọ̀:",
    msgSeedSummarySigBad:                   "Àmì àkókò tí kò tọ́",

  },

  te: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "రద్దు చేయి",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "కొత్త వెర్షన్ అందుబాటులో ఉంది:",
    lnkUpdateWhatsNew:                      "కొత్తవి ఏమిటి",
    btnUpdateDownload:                      "డౌన్‌లోడ్ చేయండి",
    lnkUpdateSkip:                          "ఈ వెర్షన్‌ను దాటవేయి",
    tipUpdateDismiss:                       "తిరస్కరించు",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "సెట్టింగ్‌లను తెరవండి",
    tipHdrHelp:                             "సహాయం",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "సెట్టింగ్‌లు",
    tabDlgSettingsDisplay:                  "ప్రదర్శన",
    tabDlgSettingsAbout:                    "గురించి",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "భాష",
    lblDlgSettingsDisplayTheme:             "థీమ్",
    btnDlgSettingsDisplayThemeDark:         "ముదురు",
    btnDlgSettingsDisplayThemeLight:        "లేత",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "కార్డ్ ప్రోగ్రెషన్‌లను ఆడియో మరియు MIDI విత్తనాలుగా ఉత్పత్తి చేస్తుంది, ఇవి Suno వంటి AI సంగీత జనరేటర్‌లను పరిమితం చేస్తాయి.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "కార్డ్ ప్రగతి",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "ప్రతి పంక్తికి ఒక బార్: ప్రతి పంక్తికి సమాన సమయం లభిస్తుంది, మరియు దానిపై ఉన్న తీగలు ఆ సమయాన్ని సమానంగా పంచుకుంటాయి (ఒక పంక్తిలో ఒంటరి తీగ మొత్తం బార్‌ను కలిగి ఉంటుంది). [Section] ట్యాగ్‌లు, ఖాళీ పంక్తులు మరియు | గుర్తులు విస్మరించబడతాయి. స్లాష్ తీగలు (C/G), 7వ (Gmaj7) మరియు N.C. మద్దతు ఇవ్వబడతాయి.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "ప్రతి పంక్తికి కొలతలు",
    lblSeedSig:                             "సమయ సంతకం",
    lblSeedLoops:                           "లూప్‌లు",
    lblSeedStyle:                           "శైలి",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to te
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to te
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to te
    optSeedStylePad:                        "Pad", // TODO: translate to te
    optSeedStyleDrone:                      "Drone", // TODO: translate to te
    optSeedStyleMarker:                     "Marker", // TODO: translate to te
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to te
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to te
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to te
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to te
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to te
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to te
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to te
    lblSeedKnobReverb:                      "reverb", // TODO: translate to te
    lblSeedInstrument:                      "వాయిద్యం",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to te
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to te
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to te
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to te
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to te
    tabSeedRender:                          "Render", // TODO: translate to te
    lblSeedKnobVolume:                      "Volume", // TODO: translate to te
    lblSeedKnobOctave:                      "Octave", // TODO: translate to te
    lblSeedKnobTune:                        "Tune", // TODO: translate to te
    tipSeedMute:                            "Mute", // TODO: translate to te
    tipSeedUnmute:                          "Unmute", // TODO: translate to te
    lblSeedReverb:                          "Reverb", // TODO: translate to te
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to te
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to te
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to te
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to te
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to te
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to te
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to te
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to te
    optSeedInstrumentSine:                  "సైన్: అంతర్నిర్మిత సింథ్",
    lblSeedFormat:                          "ఫార్మాట్",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 బిట్‌రేట్",
    lblSeedName:                            "పేరు",
    lblSeedOutput:                          "అవుట్‌పుట్",
    hntSeedOutput:                          "రెండర్ చేయబడిన ఫైల్‌ల ప్రాథమిక పేరు. రెండర్ చేసేటప్పుడు భర్తీ చేయబడిన టోకెన్‌లు: {name}, {chords} (మొదటి 8 తీగలు), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "సీడ్‌ను రెండర్ చేయండి",
    btnSeedPlay:                            "ప్లే చేయి",
    btnSeedStop:                            "ఆపు",
    msgSeedPlayFailed:                      "ప్లేబ్యాక్ విఫలమైంది",
    hntSeedRenderNeedsSave:                 "ముందుగా సీడ్‌ను .yams ఫైల్‌లో సేవ్ చేయండి — ఆడియో దాని పక్కన రెండర్ చేయబడుతుంది.",
    tipSeedLoad:                            "సీడ్ లోడ్ చేయండి",
    ttlSeedLoad:                            "సీడ్ ఫైల్ తెరవండి",
    lblSeedLoadFilter:                      "సీడ్ ఫైల్ (.yams)",
    msgSeedLoadFailed:                      "ఆ సీడ్ ఫైల్‌ను లోడ్ చేయలేకపోయింది",
    tipSeedNew:                             "కొత్త విత్తనం",
    tipSeedTabClose:                        "మూసివేయి",
    lblSeedUntitled:                        "శీర్షిక లేనిది",
    tipSeedSave:                            "సీడ్‌ను సేవ్ చేయి",
    tipSeedSaveAs:                          "సీడ్‌ను ఇలా సేవ్ చేయి…",
    ttlSeedSaveAs:                          "సీడ్‌ను ఇలా సేవ్ చేయి",
    msgSeedSaveFailed:                      "సీడ్‌ను సేవ్ చేయలేకపోయింది",
    msgSeedDropHere:                        "లోడ్ చేయడానికి .yams సీడ్ ఫైల్‌ను ఇక్కడ వదలండి",
    msgSeedBusy:                            "రెండరింగ్ అవుతోంది…",
    msgSeedEmpty:                           "ముందుగా ఒక తీగ పురోగతిని నమోదు చేయండి.",
    msgSeedFailed:                          "రెండరింగ్ విఫలమైంది",
    lblSeedResult:                          "సేవ్ చేయబడింది",
    hntSeedResult:                          "ఆడియో సీడ్‌ను Suno (కవర్)కి అప్‌లోడ్ చేయండి. ఇది మీరు టైప్ చేసిన తీగ పేర్లను కాకుండా, అది విన్న సామరస్యాన్ని అనుసరిస్తుంది.",
    msgSeedBusyInstrument:                  "వాయిద్యం లోడ్ అవుతోంది…",
    msgSeedBusyRender:                      "ఆడియో రెండరింగ్ అవుతోంది…",
    msgSeedBusySave:                        "సేవ్ అవుతోంది…",
    lblSeedSummaryChords:                   "తీగలు",
    lblSeedSummaryDuration:                 "వ్యవధి",
    lblSeedSummarySize:                     "అంచనా పరిమాణం",
    msgSeedSummaryInvalid:                  "గుర్తించబడలేదు:",
    msgSeedSummarySigBad:                   "చెల్లని సమయ సంతకం",

  },

  mr: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "रद्द करा",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "नवीन आवृत्ती उपलब्ध आहे:",
    lnkUpdateWhatsNew:                      "नवीन काय आहे",
    btnUpdateDownload:                      "डाउनलोड करा",
    lnkUpdateSkip:                          "ही आवृत्ती वगळा",
    tipUpdateDismiss:                       "डिसमिस करा",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "सेटिंग्ज उघडा",
    tipHdrHelp:                             "मदत",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "सेटिंग्ज",
    tabDlgSettingsDisplay:                  "प्रदर्शन",
    tabDlgSettingsAbout:                    "बद्दल",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "भाषा",
    lblDlgSettingsDisplayTheme:             "थीम",
    btnDlgSettingsDisplayThemeDark:         "गडद",
    btnDlgSettingsDisplayThemeLight:        "हलका",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "कॉर्ड प्रोग्रेशन्सना ऑडिओ आणि MIDI सीड्स म्हणून तयार करते जे Suno सारख्या AI संगीत जनरेटरना मर्यादित करतात.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "कॉर्ड प्रगती",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "प्रत्येक ओळीसाठी एक बार: प्रत्येक ओळीला समान वेळ मिळतो, आणि त्यावरील कॉर्ड्स तो वेळ समान रीतीने वाटून घेतात (एका ओळीतील एकटा कॉर्ड संपूर्ण बार व्यापतो). [Section] टॅग, रिकाम्या ओळी आणि | चिन्हे दुर्लक्षित केली जातात. स्लॅश कॉर्ड्स (C/G), 7वे (Gmaj7) आणि N.C. समर्थित आहेत.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "प्रत्येक ओळीसाठी मापे",
    lblSeedSig:                             "वेळ स्वाक्षरी",
    lblSeedLoops:                           "लूप्स",
    lblSeedStyle:                           "शैली",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to mr
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to mr
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to mr
    optSeedStylePad:                        "Pad", // TODO: translate to mr
    optSeedStyleDrone:                      "Drone", // TODO: translate to mr
    optSeedStyleMarker:                     "Marker", // TODO: translate to mr
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to mr
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to mr
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to mr
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to mr
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to mr
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to mr
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to mr
    lblSeedKnobReverb:                      "reverb", // TODO: translate to mr
    lblSeedInstrument:                      "वाद्य",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to mr
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to mr
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to mr
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to mr
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to mr
    tabSeedRender:                          "Render", // TODO: translate to mr
    lblSeedKnobVolume:                      "Volume", // TODO: translate to mr
    lblSeedKnobOctave:                      "Octave", // TODO: translate to mr
    lblSeedKnobTune:                        "Tune", // TODO: translate to mr
    tipSeedMute:                            "Mute", // TODO: translate to mr
    tipSeedUnmute:                          "Unmute", // TODO: translate to mr
    lblSeedReverb:                          "Reverb", // TODO: translate to mr
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to mr
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to mr
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to mr
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to mr
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to mr
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to mr
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to mr
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to mr
    optSeedInstrumentSine:                  "साइन: अंगभूत सिंथ",
    lblSeedFormat:                          "स्वरूप",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 बिटरेट",
    lblSeedName:                            "नाव",
    lblSeedOutput:                          "आउटपुट",
    hntSeedOutput:                          "रेंडर केलेल्या फाइल्सचे मूळ नाव. रेंडर करताना बदललेले टोकन: {name}, {chords} (पहिले 8 कॉर्ड), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "सीड रेंडर करा",
    btnSeedPlay:                            "प्ले करा",
    btnSeedStop:                            "थांबा",
    msgSeedPlayFailed:                      "प्लेबॅक अयशस्वी",
    hntSeedRenderNeedsSave:                 "प्रथम सीड .yams फाइलमध्ये सेव्ह करा — ऑडिओ त्याच्या शेजारी रेंडर केला जातो.",
    tipSeedLoad:                            "सीड लोड करा",
    ttlSeedLoad:                            "सीड फाइल उघडा",
    lblSeedLoadFilter:                      "सीड फाइल (.yams)",
    msgSeedLoadFailed:                      "ती सीड फाइल लोड करता आली नाही",
    tipSeedNew:                             "नवीन बीज",
    tipSeedTabClose:                        "बंद करा",
    lblSeedUntitled:                        "शीर्षकहीन",
    tipSeedSave:                            "बीज जतन करा",
    tipSeedSaveAs:                          "बीज असे जतन करा…",
    ttlSeedSaveAs:                          "बीज असे जतन करा",
    msgSeedSaveFailed:                      "बीज जतन करता आले नाही",
    msgSeedDropHere:                        "लोड करण्यासाठी .yams सीड फाइल येथे टाका",
    msgSeedBusy:                            "रेंडर होत आहे…",
    msgSeedEmpty:                           "प्रथम कॉर्ड प्रोग्रेशन प्रविष्ट करा.",
    msgSeedFailed:                          "रेंडर अयशस्वी झाले",
    lblSeedResult:                          "जतन केले",
    hntSeedResult:                          "ऑडिओ सीड Suno (कव्हर) वर अपलोड करा. ते तुम्ही टाइप केलेल्या कॉर्ड नावांपेक्षा ऐकलेल्या सुसंवादाचे अनुसरण करते.",
    msgSeedBusyInstrument:                  "वाद्य लोड होत आहे…",
    msgSeedBusyRender:                      "ऑडिओ रेंडर होत आहे…",
    msgSeedBusySave:                        "जतन करत आहे…",
    lblSeedSummaryChords:                   "कॉर्ड्स",
    lblSeedSummaryDuration:                 "कालावधी",
    lblSeedSummarySize:                     "अंदाजित आकार",
    msgSeedSummaryInvalid:                  "ओळखले नाही:",
    msgSeedSummarySigBad:                   "अवैध वेळ स्वाक्षरी",

  },

  tl: {

    // Prefix:Global - Scope:shared across all apps
    btnGlobalCancel:                        "Kanselahin",

    // Prefix:Update - Scope:in-app update notification banner
    lblUpdateAvailable:                     "May bagong bersyon:",
    lnkUpdateWhatsNew:                      "Ano ang bago",
    btnUpdateDownload:                      "I-download",
    lnkUpdateSkip:                          "Laktawan ang bersyon na ito",
    tipUpdateDismiss:                       "Balewalain",

    // Prefix:Hdr - Scope:top toolbar
    tipHdrSettings:                         "Buksan ang mga setting",
    tipHdrHelp:                             "Tulong",

    // Prefix:DlgSettings - Scope:settings dialog
    ttlDlgSettings:                         "Mga Setting",
    tabDlgSettingsDisplay:                  "Display",
    tabDlgSettingsAbout:                    "Tungkol sa",

    // Prefix:DlgSettingsDisplay - Scope:settings dialog (Display tab)
    lblDlgSettingsDisplayLang:              "Wika",
    lblDlgSettingsDisplayTheme:             "Tema",
    btnDlgSettingsDisplayThemeDark:         "Madilim",
    btnDlgSettingsDisplayThemeLight:        "Maliwanag",

    // Prefix:DlgSettingsAbout - Scope:settings dialog (About tab)
    msgDlgSettingsAboutDesc:                "Gumagawa ng mga chord progression bilang audio + MIDI seeds na naglilimita sa mga AI music generator tulad ng Suno.",

    // Prefix:Seed - Scope:main seed generator panel
    lblSeedProgression:                     "Pag-usad ng Kord",
    plhSeedProgression:                     "C Csus4 F/C G/D | C | Am Csus4 G C/G",
    hntSeedProgression:                     "Isang bar bawat linya: bawat linya ay nakakakuha ng pantay na oras, at ang mga chord dito ay pantay na naghahati ng oras na iyon (isang chord lamang sa isang linya ang humahawak sa buong bar). Ang mga tag na [Section], blangkong linya at | mark ay binabalewala. Sinusuportahan ang slash chords (C/G), 7ths (Gmaj7) at N.C.",
    lblSeedBpm:                             "BPM",
    lblSeedBars:                            "Mga sukat bawat linya",
    lblSeedSig:                             "Lagda ng oras",
    lblSeedLoops:                           "Mga Loop",
    lblSeedStyle:                           "Estilo",
    lblSeedStyleGroupPads:                  "Pads", // TODO: translate to tl
    lblSeedStyleGroupArps:                  "Arpeggios", // TODO: translate to tl
    lblSeedStyleGroupGrooves:               "Grooves", // TODO: translate to tl
    optSeedStylePad:                        "Pad", // TODO: translate to tl
    optSeedStyleDrone:                      "Drone", // TODO: translate to tl
    optSeedStyleMarker:                     "Marker", // TODO: translate to tl
    optSeedStyleArpeggio1:                  "Arpeggio 1", // TODO: translate to tl
    optSeedStyleArpeggio2:                  "Arpeggio 2", // TODO: translate to tl
    optSeedStyleArpeggio3:                  "Arpeggio 3", // TODO: translate to tl
    optSeedStyleArpeggio4:                  "Arpeggio 4", // TODO: translate to tl
    optSeedStyleArpeggio5:                  "Arpeggio 5", // TODO: translate to tl
    optSeedStyleArpeggio6:                  "Arpeggio 6", // TODO: translate to tl
    optSeedStyleGroove1:                    "Groove 1", // TODO: translate to tl
    lblSeedKnobReverb:                      "reverb", // TODO: translate to tl
    lblSeedInstrument:                      "Instrumento",
    lblSeedBassInstrument:                  "Bass", // TODO: translate to tl
    optSeedBassInstrumentSame:              "Same as instrument", // TODO: translate to tl
    plhSeedInstrumentFilter:                "Type to filter…", // TODO: translate to tl
    optSeedInstrumentFamilyAll:             "All", // TODO: translate to tl
    // ⚠ TEMPORARY library-audit triage row — EN-only (translation suspended),
    // removed with the audit together with the review UI.
    tabSeedMusic:                           "Music", // TODO: translate to tl
    tabSeedRender:                          "Render", // TODO: translate to tl
    lblSeedKnobVolume:                      "Volume", // TODO: translate to tl
    lblSeedKnobOctave:                      "Octave", // TODO: translate to tl
    lblSeedKnobTune:                        "Tune", // TODO: translate to tl
    tipSeedMute:                            "Mute", // TODO: translate to tl
    tipSeedUnmute:                          "Unmute", // TODO: translate to tl
    lblSeedReverb:                          "Reverb", // TODO: translate to tl
    optSeedReverbNone:                      "Dry: no room", // TODO: translate to tl
    optSeedReverbRoom:                      "Room: small and close", // TODO: translate to tl
    optSeedReverbChamber:                   "Chamber: medium, warm", // TODO: translate to tl
    optSeedReverbHall:                      "Hall: large and open", // TODO: translate to tl
    optSeedReverbChurch:                    "Church: very large, long tail", // TODO: translate to tl
    lblSeedReverbAmount:                    "Reverb amount", // TODO: translate to tl
    lblSeedHighpass:                        "Highpass (Hz)", // TODO: translate to tl
    lblSeedLowpass:                         "Lowpass (Hz)", // TODO: translate to tl
    optSeedInstrumentSine:                  "Sine: built-in synth",
    lblSeedFormat:                          "Format",
    optSeedFormatMp3:                       "MP3",
    optSeedFormatWav:                       "WAV",
    lblSeedMp3Bitrate:                      "MP3 bitrate",
    lblSeedName:                            "Pangalan",
    lblSeedOutput:                          "Output",
    hntSeedOutput:                          "Pangunahing pangalan ng mga na-render na file. Mga token na pinalitan sa pag-render: {name}, {chords} (ang unang 8 chords), {style}, {instrument}, {bpm}, {loops}.",
    btnSeedRender:                          "I-render ang seed",
    btnSeedPlay:                            "I-play",
    btnSeedStop:                            "Itigil",
    msgSeedPlayFailed:                      "Nabigo ang pag-playback",
    hntSeedRenderNeedsSave:                 "I-save muna ang seed sa isang .yams file — ang audio ay nire-render sa tabi nito.",
    tipSeedLoad:                            "I-load ang seed",
    ttlSeedLoad:                            "Buksan ang seed file",
    lblSeedLoadFilter:                      "Seed file (.yams)",
    msgSeedLoadFailed:                      "Hindi ma-load ang seed file na iyon",
    tipSeedNew:                             "Bagong binhi",
    tipSeedTabClose:                        "Isara",
    lblSeedUntitled:                        "Walang pamagat",
    tipSeedSave:                            "I-save ang seed",
    tipSeedSaveAs:                          "I-save ang seed bilang…",
    ttlSeedSaveAs:                          "I-save ang seed bilang",
    msgSeedSaveFailed:                      "Hindi mai-save ang seed",
    msgSeedDropHere:                        "I-drop ang isang .yams seed file upang i-load ito",
    msgSeedBusy:                            "Nagre-render…",
    msgSeedEmpty:                           "Maglagay muna ng chord progression.",
    msgSeedFailed:                          "Nabigo ang pag-render",
    lblSeedResult:                          "Naka-save",
    hntSeedResult:                          "I-upload ang audio seed sa Suno (Cover). Sinusunod nito ang harmoni na naririnig nito, hindi ang mga pangalan ng chord na iyong tina-type.",
    msgSeedBusyInstrument:                  "Naglo-load ng instrumento…",
    msgSeedBusyRender:                      "Nagre-render ng audio…",
    msgSeedBusySave:                        "Nagse-save…",
    lblSeedSummaryChords:                   "Kord",
    lblSeedSummaryDuration:                 "Tagal",
    lblSeedSummarySize:                     "Tinatayang laki",
    msgSeedSummaryInvalid:                  "Hindi nakilala:",
    msgSeedSummarySigBad:                   "Hindi balidong time signature",

  },
};

export const LANGUAGES = [
  { key: 'ar', label: 'العربية' },
  { key: 'bn', label: 'বাংলা' },
  { key: 'bg', label: 'Български' },
  { key: 'ca', label: 'Català' },
  { key: 'zh_CN', label: '简体中文' },
  { key: 'zh_TW', label: '繁體中文' },
  { key: 'cs', label: 'Čeština' },
  { key: 'da', label: 'Dansk' },
  { key: 'de', label: 'Deutsch' },
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'fa', label: 'فارسی' },
  { key: 'fi', label: 'Suomi' },
  { key: 'fr', label: 'Français' },
  { key: 'gl', label: 'Galego' },
  { key: 'el', label: 'Ελληνικά' },
  { key: 'ha', label: 'Hausa' },
  { key: 'he', label: 'עברית' },
  { key: 'hi', label: 'हिन्दी' },
  { key: 'hr', label: 'Hrvatski' },
  { key: 'hu', label: 'Magyar' },
  { key: 'hy', label: 'Հայերեն' },
  { key: 'id', label: 'Indonesia' },
  { key: 'it', label: 'Italiano' },
  { key: 'ja', label: '日本語' },
  { key: 'ko', label: '한국어' },
  { key: 'lt', label: 'Lietuvių' },
  { key: 'mk', label: 'Македонски' },
  { key: 'mr', label: 'मराठी' },
  { key: 'ms', label: 'Melayu' },
  { key: 'nl', label: 'Nederlands' },
  { key: 'nb', label: 'Norsk' },
  { key: 'pa', label: 'ਪੰਜਾਬੀ' },
  { key: 'pl', label: 'Polski' },
  { key: 'pt_BR', label: 'Português (Brasil)' },
  { key: 'pt_PT', label: 'Português (Portugal)' },
  { key: 'ro', label: 'Română' },
  { key: 'ru', label: 'Русский' },
  { key: 'sk', label: 'Slovenčina' },
  { key: 'sl', label: 'Slovenščina' },
  { key: 'sr', label: 'Српски' },
  { key: 'sv', label: 'Svenska' },
  { key: 'sw', label: 'Kiswahili' },
  { key: 'ta', label: 'தமிழ்' },
  { key: 'te', label: 'తెలుగు' },
  { key: 'th', label: 'ไทย' },
  { key: 'tl', label: 'Filipino' },
  { key: 'tr', label: 'Türkçe' },
  { key: 'uk', label: 'Українська' },
  { key: 'ur', label: 'اردو' },
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'yo', label: 'Yorùbá' },
];

const base = TRANSLATIONS.en;

// ⚠ CLAUDE: useT MUST return a useMemo-wrapped function. The bare form
//   `return (key) => ...` produces a new function every render, which destabilizes
//   every useCallback/useEffect depending on `t` → infinite render loop, EMFILE crashes.
//   See CLAUDE-i18n.md → "useT() must memoize". Do not "simplify" this.
export function useT(langKey) {
  return useMemo(() => {
    const lang = TRANSLATIONS[langKey] || base;
    return (key) => lang[key] ?? base[key] ?? key;
  }, [langKey]);
}

export function getT(langKey) {
  const lang = TRANSLATIONS[langKey] || base;
  return (key) => lang[key] ?? base[key] ?? key;
}

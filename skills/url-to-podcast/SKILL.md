---
name: "url-to-podcast"
description: "Converts a URL into a podcast-style MP3. Fetches the page, rewrites the content as an engaging podcast script, and generates audio using Edge TTS. Use for \"read this URL\", \"podcast from this link\", \"turn this article into audio\", \"read this out loud\"."
---

## URL-to-Podcast Skill

### When to trigger
User pastes a URL and wants it read aloud or converted to podcast audio.

### Workflow

1. **Fetch the URL** using `web_fetch(url)`. If content is truncated, paginate with `start_index` until you have the full article.

2. **Choose language & voice** based on the content language:
   - English → `en-US-AndrewMultilingualNeural` (male) or `en-US-AvaMultilingualNeural` (female)
   - German → `de-DE-FlorianMultilingualNeural` (male) or `de-DE-SeraphinaMultilingualNeural` (female)
   - Default to the multilingual voice matching the detected language, male voice by default.
   - If the user specifies a voice preference, honor it.

3. **Rewrite as podcast script.** Transform the raw article content into a natural, conversational podcast monologue:
   - Add a brief intro: "Hey, welcome back! Today we're diving into..."
   - Organize the key points conversationally, as if explaining to a curious friend
   - Use transitions like "Now here's where it gets interesting...", "So what does this mean?"
   - Add a brief outro: "That's the rundown on... Thanks for listening!"
   - Keep the original facts and data accurate — don't invent information
   - Target length: roughly the same content density as the original, but spoken-word style
   - Write it as plain text (no markdown, no headings, no bullets — just natural speech)

4. **Generate the audio:**
   - Save the podcast script to a temp file: `C:\Users\<username>\.copilot\session-state\<session-id>\files\podcast_script.txt`
   - Run the TTS generator:
     ```
     node C:\Users\<username>\.copilot\skills\url-to-podcast\tts.js "<outputDir>" "<voice>" "<scriptFile>"
     ```
     where `<outputDir>` is the workspace directory (Clawpilot folder) and `<scriptFile>` is the temp text file.
   - The script outputs JSON on the last line with path, size, duration.
   - Use initial_wait of 120+ seconds — TTS generation can take a while for long articles.

5. **Present the result:**
   - Show the article title and source
   - Show the podcast duration and file path
   - Mention the user can open the MP3 file to listen
   - Offer to regenerate with a different voice if desired

### Voice options (for user reference)
| Language | Male | Female |
|----------|------|--------|
| English (US) | AndrewMultilingualNeural | AvaMultilingualNeural |
| English (US) | BrianMultilingualNeural | EmmaMultilingualNeural |
| German | FlorianMultilingualNeural | SeraphinaMultilingualNeural |
| French | RemyMultilingualNeural | VivienneMultilingualNeural |
| Italian | GiuseppeMultilingualNeural | — |
| Portuguese (BR) | — | ThalitaMultilingualNeural |

### Notes
- The TTS helper is at: `C:\Users\<username>\.copilot\skills\url-to-podcast\tts.js`
- It requires the `msedge-tts` npm package (installed in the Clawpilot workspace)
- MP3 output is 96kbps mono — good quality for speech
- For very long articles, the script auto-splits into chunks and concatenates
- The final MP3 is saved as `podcast.mp3` in the output directory



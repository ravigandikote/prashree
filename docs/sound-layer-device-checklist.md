# Sound layer — device checklist

What was verified in automation (headless Chromium and WebKit, desktop and
emulated iPhone) is in CLAUDE.md. Real devices behave differently in two
ways automation cannot reach: the iOS hardware silent switch, and the real
autoplay policy of a shipped browser. Run this on each device once, on the
deployed site, with an artwork that has a tone attached.

## iOS Safari (the one that breaks things)

1. Fresh visit to an artwork page with sound off (default). Expect: no
   sound, header shows "Sound off", no tone file in Settings → Safari →
   Advanced → Web Inspector network list.
2. Tap the header toggle. Expect: "Sound on", and about a second later the
   tone fades in; the small dot appears in the toggle; the play control
   under the picture reads "Pause this tone".
3. Switch to another app, then back. Expect: the tone stopped while away
   and fades back in after a second.
4. Flip the hardware silent switch on. Expect: the tone goes silent, and
   the site does **not** change the toggle — it still says "Sound on",
   because it reports what you asked for, not what the speaker does.
5. Reload the page. Expect: the toggle shows "Sound off" until you tap
   anything; the first tap turns it back on without a second hint.
6. Open "Two minutes of stillness", tap Begin. Expect: the artwork tone
   stops, a gong (if one is uploaded), the ring breathes, no scrolling of
   the page behind. Escape via the ✕. Expect: focus lands on the button.

## Android Chrome

Steps 1, 2, 3, 5, 6 above. Also: with sound on, open a second artwork from
"You may also like". Expect a crossfade, not a gap or an overlap.

## Desktop Safari and Chrome

Steps 1, 2, 3, 5, 6. Also the keyboard pass: Tab to the toggle, Enter;
Tab to the stillness button, Enter, Enter to begin, Escape to leave.
Expect focus back on the button.

If any step fails, note the device, OS version, browser version, and step
number.

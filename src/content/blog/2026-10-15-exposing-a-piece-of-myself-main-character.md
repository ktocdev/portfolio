---
title: "Exposing a Piece of Myself: Main Character RAG Journal"
date: 2026-10-15
summary: Looking back at the process of creating the Main Character RAG-powered journal app, as I plan to release it to a wider audience.
tags: [main character, projects, releases, journal, writing]
draft: true
---

_As I look down into my cup of coffee, I can see myself looking back._

![Screenshot of the Main Character chat screen answering my question about when I started to build the app](/blog/releasing-a-piece-of-myself-main-character/main-character-timeline.png)

Feeling down.. looking down. Contemplating giving up. The external is too loud to see the true story. 

I look into the dark mode cocoa background of my Main Character app, and I want my character arc to get past this moment. I can see how the story got here, and I believe there is a way through it. 

It all started at the end of December 2025, when I was facing a personal crisis, and I turned to Claude. I never imagined myself doing that, it seemed odd to confide in a text prediction machine. But in a moment of despair, I asked it if what I was feeling was justified. It had a strange calming effect. 

That turned into a series of writings, and took the shape of a journal. I was not asking for advice, I was just putting my thoughts and feelings into the LLM and seeing what it returned. It would go well for a few entries, then it would start to hallucinate and forget stuff. I made a workflow of having Claude create a summary of a long chat, then editing and uploading that summary as context for a new instance. This worked well, until the summaries became too long and unwieldy. 

I began to learn about RAG (retrieval-augmented generation) and how it could be used to increase LLM recall on a set of data. In March 2026, I made a plan in Claude Code to build the RAG journal. Due to life constraints, I didn't get around to building it until July 2026, when Anthropic released Fable. 

I was staying at my parents' house, post meniscus knee surgery. It just so happened to be during the time when Fable tokens counted toward the normal usage limits. While stuck in a place that was not my own, I allowed the fervor of Fable to take over...

Fable changed how I built stuff. It was capable of one-shotting incredibly complex plans, I could see from the very moment I tried it. According to my Main Character chat companion:

> - Sunday, July 5: you started it. You mentioned this the next evening, in the July 6 entry ("Journal entry 2026-07-06 21:08"): "my RAG journal which i started yesterday."
> - Monday, July 6: you'd napped from 5 to 7:30pm after the REDACTED work, and you said you were "driven to get the RAG journal in a good place before fable becomes metered." The app asked you to write that entry to test the companion: "so that is pretty meta." On July 8 you added that "the night previous (monday night) i was up until 2am working on this RAG journal."
> - Tuesday, July 7: you finished it while also working on the REDACTED review guide.
>
> From your first entry in the app, July 7 ("Journal entry 2026-07-07 17:01"):
> - "i made the RAG journal. it is working, all thanks to powering through the plan with fable. this is my first entry in it and it is a bit weird."
> - "the ai extractor's patterns were very intense to read, and the claude code instance even tried to be gentle with me about it."
> - "the rag journal also created a lot of work for me. there are over 300 entities. i never realized how many people i interact with actually." You also noted that "it created a triage system for me to vet them. fun for later."
> - "i have honestly been fixated on my fable personal projects."
>
> From the July 8 entry ("7/1/26 — continued"):
> - "yesterday i was in a full AI mania spiral... it was a crazy mental experience, firing on all pistons."
> - "i finished the RAG journal (moreso managing fable building it)"
> - "we lost a few days of claude response due to developing this."
> - "i am not the only one in a AI mania spiral - all of us claude fans were trying to squeeze what we could out of fable... it was a very funny thing to watch on reddit."
>
> The next day, July 9, you were "do some fixes on this Rag journal. mostly UI stuff."

The functionality in a nutshell: you write an entry and the companion responds, supportive but not sycophantic (I did have to train it to never say "that's not nothing"). The response can make you smile with a memory and a word of grounding. You can turn the reply off if you feel like writing without a comment. After about a week of writing (the journal will message you that it's about time), you "close the chapter". That starts all the processes: indexing, summarizing, aggregating, etc. As creepy as it may sound, it tracks the places, projects, and _people_. It writes weekly summaries and points out patterns over time. It assigns categories to entries that shape a domain summary (work, relationships, social, etc). So when you start your next chapter, the journal has all that context to connect the dots of what you write. 

Once it was built, I had my own journal UI to play with, and my entries were available in journal memory. It was like LiveJournal all over again, but instead of random people commenting, I had my Claude companion powered by a Python system prompt. Looking up specifics on my records was as easy as googling, with the added power of AI reasoning. 

The name became _Main Character_, an ironic nod at memes about doing self-centered, attention-seeking behaviors in public. Also, in our perception of life, we are all our own main characters. This journal helps orient you to yourself and your journey. 

In August 2026, I learned about my position being eliminated. The first thing I wanted to do with my freed up time was to make Main Character something I could share with the world. It was very helpful for me, so perhaps someone else might find it so. 

I set out to make a demo. The real app runs on a Claude API key, but the demo would not. I generated a fake journal of about 30 entries, designed to include the data points that show off the app's main features. I ran those entries through Claude sessions to generate companion responses, then transformed them into canned replies. 

The tricky part was making the demo interactive without being confusing, while still sparking curiosity. When visitors open the Write screen, the next entry is already filled in. If they edit it and send it anyway, the original entry is what gets displayed, and the companion replies as it did in the real session. Visitors can walk through the entire flow this way, including closing a journal chapter and generating a life summary.

Along the way, I smoothed out UI interactions that didn't feel intuitive, dogfooding the app as I built out the final product. My favorite feature? Retiring people you don't want to think about anymore :). I also really enjoyed having full control over creating the brand identity and the splash page's spotlight effects. Check it out: https://ktoc.dev/main-character/.

Finally, finished. Now I am ready to share it. To be honest, I feel more like looking into a beer than a coffee writing this. It is an achievement to see a vision through, be proud of it, own it for all it's quirks, even if no one gets it.

I am not sure what it will bring, but it will be nice to check this off my list, and move on to the next project. Main Character is something that I use every day, and who knows how long it will be a part of my life.


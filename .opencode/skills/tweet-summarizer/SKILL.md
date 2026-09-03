---
name: tweet-summarizer
description: Fetches, date-filters, and synthesizes posts from the platform within a defined timeframe.
parameters:
  timeframe:
    type: string
    description: "The time range to analyze (e.g., 'last 2 hours', 'last 24 hours', 'since yesterday', '2026-09-01 to 2026-09-03')."
  username:
    type: string
    optional: true
    description: "Optional specific username. If omitted, analyzes all explore feed posts."
---

### Execution Workflow

When this skill is invoked, follow these exact steps:

1. **Calculate the Timestamp Range:**
   - Resolve the user's `timeframe` into two timestamps: `startTime` and `endTime` (default `endTime` to current timestamp).
   - Example: "last 24 hours" -> `startTime = Date.now() - 24 * 60 * 60 * 1000`.

2. **Retrieve Posts via MCP:**
   - If a `username` is specified, call the MCP tool `get_user_posts({ username })`.
   - Otherwise, call `get_explore_posts({ page: 1, limit: 50 })`. If the oldest post on page 1 is still newer than `startTime`, paginate to page 2 (`page: 2`) to ensure full coverage.

3. **Time-Window Filtering:**
   - Parse each post's `createdAt` timestamp.
   - Retain only posts where: `startTime <= new Date(post.createdAt) <= endTime`.
   - If no posts match, politely inform the user that no activity occurred in this timeframe.

4. **Analysis & Synthesis:**
   - **Key Themes:** Group matching posts into 2–4 dominant topics or discussions.
   - **Sentiment & Tone:** Assess whether overall conversation is positive, technical, inquisitive, critical, or casual.
   - **Key Voices:** Note the most active participants (`@username`).

5. **Generate Output Report:**
   Format the response exactly as follows:

   # 📊 Post Summary Report
   - **Analyzed Period:** [startTime] → [endTime]
   - **Total Posts Processed:** [Count]
   - **Active Contributors:** [@user1, @user2, ...]

   ## 📌 Key Discussion Themes
   - **[Theme 1 Title]:** [Concise 1-2 sentence overview of what users are discussing]
   - **[Theme 2 Title]:** [Concise 1-2 sentence overview]

   ## 🎭 Sentiment & Atmosphere
   - [Brief assessment of the mood, engagement tone, and dominant sentiments]

   ## ⭐ Notable Highlights
   > "[Selected impactful post content]"  
   > — **@[Author]** ([Timestamp])
---
name: topic-discovery
description: Discovers trending topics and retrieves posts matching specific hashtag(s).
parameters:
  action:
    type: string
    enum: ["discover_trends", "find_by_tag"]
    description: "'discover_trends' to rank platform-wide hashtags, or 'find_by_tag' to fetch posts for specific tags."
  tags:
    type: array
    items: string
    optional: true
    description: "Required when action is 'find_by_tag'. Example: ['#AI', '#nextjs', '#release']"
---

### Execution Workflow

When this skill is invoked, follow these steps:

1. **Fetch Posts via MCP:**
   - Call the MCP tool `get_explore_posts({ page: 1, limit: 50 })` to fetch the latest platform feed.

2. **Regex Hashtag Extraction:**
   - Scan each post's `content` using the pattern: `/#([a-zA-Z0-9_\u0600-\u06FF]+)/g`.
   - Store all detected hashtags associated with each post in normalized lowercase format.

3. **Action Routing:**

   #### Branch A: `action == "discover_trends"`
   - Aggregate frequencies of all detected hashtags across all posts.
   - If no hashtags exist in the feed, output: *"No hashtags currently detected in the feed."*
   - Otherwise, sort descending by frequency and present:

   # 📈 Trending Topics
   | Rank | Hashtag | Occurrences | Recent Author |
   | :--- | :--- | :--- | :--- |
   | 1 | `#hashtag1` | X | `@username` |
   | 2 | `#hashtag2` | Y | `@username` |

   #### Branch B: `action == "find_by_tag"`
   - Normalize target `tags` (prepend `#` if missing, convert to lowercase).
   - Filter all posts whose content matches **any** of the requested tags.
   - If no matching posts are found, inform the user clearly.
   - Format matching results:

   # 🔍 Posts Matching: [Requested Tags]
   - **Matches Found:** [Count]

   ### Results:
   1. **@[Author]** (`[CreatedAt]`):
      > [Full post text]  
      *(Post ID: `[id]`)*
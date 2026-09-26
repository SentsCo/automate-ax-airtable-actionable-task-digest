# Show only the Airtable tasks your team can act on today

Get a weekday Slack list of Airtable tasks whose dependencies are complete, so the team can focus on work that is ready to move.

An agency board can contain hundreds of tasks, many waiting on another piece of work. A long list of due dates does not tell the team what they can actually finish today.

This example reads every page of one Airtable task table, checks each task's linked Blocked By records, and posts a weekday Slack digest of To do or In progress tasks whose dependencies are Done. It reports the total ready count and shows the first 40 so the message stays readable.

## Set it up with a coding agent

Copy the setup prompt from [the article](https://automate.ax/articles/airtable-actionable-task-digest) into your coding agent. The agent creates the Automate.ax project, asks for your choices, guides account authorization, checks the automation, and deploys it. You do not need to clone this repository yourself when using the prompt.

You'll choose:

- An Airtable task table with Name, Status, and a linked-record Blocked By field; an optional text Owner field adds ownership to the digest. The agent can inspect or create the schema.
- A team Slack channel for the daily digest.
- Account authorization for Airtable and Slack. Slack requires a paid workspace for the current Automate.ax connection.

## Manual setup

If you prefer to set it up yourself:

```sh
git clone https://github.com/SentsCo/automate-ax-airtable-actionable-task-digest.git
cd automate-ax-airtable-actionable-task-digest
bun install
bunx automate.ax login
bunx automate.ax init
bun run typecheck
bunx automate.ax deploy
```

Connect the accounts requested by Automate.ax when you deploy. The platform stores credentials outside this repository. Set any project parameters requested by the automation, then review the read and write operations before turning it on.

## Check a run

Use test records with one complete dependency, one incomplete dependency, and one missing linked record. Confirm that only the truly ready task appears.

## Limits

- The example assumes dependencies are linked records in the same table and status values are To do, In progress, and Done. Map different schemas before deployment.
- The message displays the first 40 ready tasks and includes the full ready count. It does not assign or reorder work.
- Airtable records with a missing dependency are treated as blocked rather than silently shown as ready.

The workflow responds to [a real problem described by an agency's 400-task Airtable board](https://www.reddit.com/r/agency/comments/1qyn9ke). The public report informed the example; it is not an endorsement of this implementation.

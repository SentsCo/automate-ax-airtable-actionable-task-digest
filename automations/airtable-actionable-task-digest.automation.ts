import { automation, onSchedule, t, transform } from "automate.ax"
import { airtable } from "automate.ax/airtable"
import { slack } from "automate.ax/slack"

export default automation(
  "Show the tasks that can move today",
  {
    parameters: [
      { label: "Airtable base ID", name: "baseId", type: "text" },
      { label: "Tasks table", name: "table", type: "text" },
      { label: "Slack team channel ID", name: "slackChannelId", type: "text" },
    ],
  },
  ({ parameters }) => {
    const tick = onSchedule({ schedule: "0 9 * * 1-5", timeZone: "UTC" })
    // No maxRecords: the action follows Airtable's result pages.
    const tasks = airtable.listRecords({
      baseId: parameters.baseId,
      table: parameters.table,
    })

    const digest = transform([tasks, tick], ({ records }) => {
      const byId = new Map(records.map((record) => [record.id, record]))
      const ready = records.filter((record) => {
        const status = record.fields.Status
        if (status !== "To do" && status !== "In progress") return false
        const dependencies = record.fields["Blocked By"]
        if (!Array.isArray(dependencies)) return true
        return dependencies.every((id) => {
          if (typeof id !== "string") return false
          const dependency = byId.get(id)
          return dependency?.fields.Status === "Done"
        })
      })
      const lines = ready.slice(0, 40).map((record) => {
        const name =
          typeof record.fields.Name === "string"
            ? record.fields.Name
            : record.id
        const owner =
          typeof record.fields.Owner === "string"
            ? record.fields.Owner
            : "unassigned"
        return `• ${name} — ${owner} (Airtable record ${record.id})`
      })
      return { count: ready.length, lines }
    }).filter(({ count }) => count > 0)

    slack.sendMessage({
      conversation: parameters.slackChannelId,
      text: t`${digest.count} tasks can move today. Showing the first 40:\n${digest.lines.transform((lines) => lines.join("\n"))}`,
      unfurlLinks: false,
    })
  },
)

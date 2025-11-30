import type { UISchema } from "@/features/json-form/types/uischema";
import { getScope } from "@/features/json-form/utils/get-scope";
import type { ScheduleNodeSchema } from "./schema";

const scope = getScope<ScheduleNodeSchema>;

export const uischema: UISchema = {
   type: "VerticalLayout",
   elements: [
      {
         type: "Text",
         label: "Label",
         scope: scope("properties.label"),
      },
      {
         type: "TextArea",
         label: "Description",
         scope: scope("properties.description"),
         placeholder: "Describe what this schedule does",
      },
      {
         type: "Accordion",
         label: "Schedule Configuration",
         elements: [
            {
               type: "Select",
               label: "Schedule Type",
               scope: scope("properties.scheduleType"),
            },
            {
               type: "Group",
               label: "Interval Settings",
               elements: [
                  {
                     type: "HorizontalLayout",
                     elements: [
                        {
                           type: "Text",
                           label: "Repeat Every",
                           scope: scope("properties.intervalValue"),
                           inputType: "number",
                           placeholder: "1",
                        },
                        {
                           type: "Select",
                           label: "Unit",
                           scope: scope("properties.intervalUnit"),
                        },
                     ],
                  },
               ],
            },
            {
               type: "Group",
               label: "Cron Expression",
               elements: [
                  {
                     type: "Text",
                     label: "Cron Expression",
                     scope: scope("properties.cronExpression"),
                     placeholder: "*/5 * * * * (every 5 minutes)",
                  },
                  {
                     type: "Label",
                     text: "Format: minute hour day month weekday",
                  },
               ],
            },
            {
               type: "Group",
               label: "Loop Count",
               elements: [
                  {
                     type: "Text",
                     label: "Number of Iterations",
                     scope: scope("properties.loopCount"),
                     inputType: "number",
                     placeholder: "10",
                  },
               ],
            },
         ],
      },
      {
         type: "Accordion",
         label: "Advanced Options",
         elements: [
            {
               type: "Switch",
               label: "Start Immediately",
               scope: scope("properties.startImmediately"),
            },
            {
               type: "Switch",
               label: "Enabled",
               scope: scope("properties.enabled"),
            },
         ],
      },
   ],
};

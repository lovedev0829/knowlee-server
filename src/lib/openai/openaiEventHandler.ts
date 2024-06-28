import { Request, Response } from "express";
import { EventEmitter } from "events";
import OpenAI from "openai";
import { AssistantStreamEvent } from "openai/resources/beta/assistants";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { availableOpenAIFunctions } from "../../services/openai/functions";
import { RunSubmitToolOutputsParamsStream } from "openai/lib/AssistantStream";
import { handleOpenAIUsage } from "../../services/openAI.services";

export class OpenAIAssistantStreamEventHandler extends EventEmitter {
  private openai: OpenAI;
  private req: Request;
  private res: Response;

  constructor({
    openai,
    req,
    res,
  }: {
    openai: OpenAI;
    req: Request;
    res: Response;
  }) {
    super();
    this.openai = openai;
    this.req = req;
    this.res = res;
  }

  async onEvent(streamEvent: AssistantStreamEvent): Promise<void> {
    try {
      const { data, event } = streamEvent;
      // console.log("event----->", event);
      switch (event) {
        case "thread.message.delta":{
          const message = data?.delta?.content?.[0];
          if(message?.type === "text"){
            // console.log("text----->", message.text?.value);
            this.res.write(message.text?.value);
          }
          break;
        }

        case "thread.run.requires_action": {
          // requiresAction = true;
          await this.handleRequiresAction(streamEvent.data);
          break;
        }

        case "thread.run.completed": {
          if (data.usage) {
            // track usage
            await handleOpenAIUsage({
              usage: data.usage,
              req: this.req,
            });
          }
          this.res.end();
          break;
        }

        case "thread.run.expired":
        case "thread.run.failed":
        case "thread.run.cancelled": {
          this.res.end();
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error("Error handling event:", (error as Error).message);
    }
  }

  private async handleRequiresAction(run: Run): Promise<Run | undefined> {
    try {
      const toolCalls = run.required_action?.submit_tool_outputs.tool_calls;
      if (!toolCalls?.length) {
        // console.log("No toolCalls", run);
        return run;
      }
      const toolOutputs = [];
      for (const call of toolCalls) {
        const { function: fn, id: toolCallId, type } = call;

        const functionToCall = availableOpenAIFunctions[fn.name];
        // console.log("fn----->", fn);

        if (!functionToCall) {
          console.error(
            `No matching function found for ${fn.name} in availableOpenAIFunctions`
          );
          toolOutputs.push({
            tool_call_id: toolCallId,
            output: "",
          });
          continue;
        }
        const functionArgs = JSON.parse(fn.arguments);

        // call actual function with arguments received from openAI
        const functionResponse = await functionToCall({
          user: this.req.user,
          ...functionArgs,
        });

        toolOutputs.push({
          tool_call_id: toolCallId,
          output: JSON.stringify(functionResponse || "success"),
        });
        // console.log("functionResponse----->", JSON.stringify(functionResponse));
      }
      await this.handleSubmitToolOutputsStream(run.thread_id, run.id, {
        tool_outputs: toolOutputs,
      });
    } catch (error) {
      console.error(
        "Error processing required action:",
        (error as Error).message
      );
    }
  }

  private async handleSubmitToolOutputsStream(
    threadId: string,
    runId: string,
    body: RunSubmitToolOutputsParamsStream
  ): Promise<void> {
    try {
      const stream = this.openai.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        body
      );
      for await (const event of stream) {
        this.emit("event", event);
      }
    } catch (error) {
      console.error("Error submitting tool outputs:", (error as Error).message);
    }
  }
}

import { ArgType } from "@storybook/api";
import { ControlType } from "@storybook/components";

export type CustomArgType = ArgType & {
  type?: {
    required: boolean;
  };
  table: {
    type: { summary: string };
    defaultValue?: { summary: string };
  };
  control?: {
    type: ControlType;
  };
  action?: string;
};

export type StoryDocumentProps = {
  tsUrl?: string;
  jsUrl?: string;
};

export type FileProperties = {
  fileType: string;
  fileSize: string;
};

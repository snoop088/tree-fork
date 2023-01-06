import React, { PropsWithChildren, ReactElement } from "react";
import { NodeModel } from "./types";
type Props = PropsWithChildren<{
    parentId: NodeModel["id"];
    depth: number;
    style?: React.CSSProperties;
}>;
export declare const Container: <T>(props: Props) => ReactElement;
export {};

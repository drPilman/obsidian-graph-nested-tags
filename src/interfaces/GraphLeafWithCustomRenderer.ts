import { WorkspaceLeaf } from "obsidian";
import { LeafRenderer } from "./LeafRenderer";

type CustomLeaf = {
	view: {
		renderer: LeafRenderer;
	};
};

export type GraphLeafWithCustomRenderer = WorkspaceLeaf & CustomLeaf;

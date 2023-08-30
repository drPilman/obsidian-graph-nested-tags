/* eslint-disable @typescript-eslint/ban-types */
import { WorkspaceLeaf } from "obsidian";

export interface CustomLeaf {
	view: {
		renderer: {
			setData: Function;
			_setData?: Function;
		};
	};
}

export type GraphLeaf = WorkspaceLeaf & CustomLeaf;

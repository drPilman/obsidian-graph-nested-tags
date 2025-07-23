import { Plugin } from "obsidian";
import { GraphLeafWithCustomRenderer } from "./interfaces/GraphLeafWithCustomRenderer";


export default class GraphNestedTagsPlugin extends Plugin {
	// inject our own wrapper around graphLeaf.view.renderer.setData
	// which will manipulate add tag -> subtag hierarchy  
	inject_setData(graphLeaf: GraphLeafWithCustomRenderer) {
		const leafRenderer = graphLeaf.view.renderer;

		if (leafRenderer.originalSetData == undefined) {
			leafRenderer.originalSetData = leafRenderer.setData;
		}

		leafRenderer.setData = (data: any) => {
			const nodes = data.nodes;
			let parent;
			let last_tag: string;
			for (const id in nodes) {
				if (nodes[id].type === "tag") {
					last_tag = id;
					for (let i = id.length - 1; i >= 2; i--) {
						if (id[i] === "/") {
							parent = id.slice(0, i);
							if (!(parent in nodes)) {
								nodes[parent] = { type: "tag", links: [] };
								data.numLinks++;
							}
							nodes[last_tag].links[parent] = true;
							data.numLinks++;
							last_tag = parent;
						}
					}
				}
			}
			return leafRenderer.originalSetData?.(data);
		};
		return graphLeaf;
	}

	async onload() {
		// inject Graphs that will be opened in the future
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				for (const leaf of this.app.workspace.getLeavesOfType(
					"graph"
				)) {
					if (
						(leaf as GraphLeafWithCustomRenderer).view.renderer.originalSetData === undefined
					) {
						this.inject_setData(leaf as GraphLeafWithCustomRenderer);
					}
				}
			})
		);
		this.app.workspace.trigger("layout-change");
		for (const leaf of this.app.workspace.getLeavesOfType("graph")) {
			leaf.view.unload();
			leaf.view.load();
		}
	}

	onunload() {
		// undo injections and reload the Graphs
		for (const leaf of this.app.workspace.getLeavesOfType(
			"graph"
		) as GraphLeafWithCustomRenderer[]) {
			if (leaf.view.renderer.originalSetData) {
				leaf.view.renderer.setData = leaf.view.renderer.originalSetData;
				delete leaf.view.renderer.originalSetData;
				leaf.view.unload();
				leaf.view.load();
			}
		}
	}

	async loadSettings() {}

	async saveSettings() {}
}

import { Plugin } from "obsidian";
import { GraphLeaf } from "types";

export default class GraphNestedTagsPlugin extends Plugin {
	// At nodes changes graphLeaf.view.renderer.setData calls, so we need to step in and change links.
	inject_setData(graphLeaf: GraphLeaf) {
		const r = graphLeaf.view.renderer;

		if (!r._setData) {
			r._setData = r.setData;
		}
		r.setData = (data: any) => {
			const nodes = data.nodes;
			let parent;
			let last_tag: string;
			for (const id in nodes) {
				if (nodes[id].type === "tag") {
					last_tag = id;
					for (let i = id.length - 1; i > 2; i--) {
						if (id[i] === "/") {
							parent = id.slice(0, i);
							if (!(parent in nodes)) {
								nodes[parent] = {"type": "tag", links: []}
								data.numLinks++;
							}
							nodes[last_tag].links[parent] = true;
							data.numLinks++;
							last_tag = parent;
						}
					}
				}
			}
			return r._setData?.(data);
		};
		return graphLeaf;
	}

	async onload() {
		// inject each already opened Graph, and reload it.
		for (const leaf of this.app.workspace.getLeavesOfType("graph")) {
			this.inject_setData(leaf as GraphLeaf);
			leaf.view.unload();
			leaf.view.load();
		}

		// inject Graphs that will be opened in the future
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf: GraphLeaf) => {
				if (leaf?.view.getViewType() === "graph") {
					this.inject_setData(leaf);
				}
			})
		);
	}

	onunload() {
		// undone injections and reload the Graphs
		for (const leaf of this.app.workspace.getLeavesOfType(
			"graph"
		) as GraphLeaf[]) {
			if (leaf.view.renderer._setData) {
				leaf.view.renderer.setData = leaf.view.renderer._setData;
				delete leaf.view.renderer._setData;
				leaf.view.unload();
				leaf.view.load();
			}
		}
	}

	async loadSettings() {}

	async saveSettings() {}
}

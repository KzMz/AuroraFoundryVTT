/**
 * This is your JavaScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */

// Import JavaScript modules
import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { AuroraBuilder } from './aurora.js';

class AuroraBuilderVTT {
	
	constructor() {
		this.hookInit();
		this.hookActorSheet();
		this.hookActorDirectory();
		
		this.Aurora = new AuroraBuilder();
	}
	
	hookInit() {
		Hooks.once('init', async function() {
			console.log('AuroraExporter | Initializing AuroraExporter');

			// Assign custom classes and constants here
			
			// Register custom module settings
			registerSettings();
			
			// Preload Handlebars templates
			await preloadTemplates();
		});
	}
	
	hookActorSheet() {
		Hooks.on('renderActorSheet5eCharacter', (app, html, data) => {
			if (!data.owner) return;
			
			const windowHeader = html.parent().parent().find('.window-header');
			const windowCloseBtn = windowHeader.find('.close');
			const exportButton = $('<a class="export-aurora-sheet"><i class="fas fa-file-export"></i> Aurora Export</a>');
			
			windowHeader.find('.export-aurora-sheet').remove();
			windowCloseBtn.before(exportButton);
			
			exportButton.click(ev => {
				ev.preventDefault();
				this.exportDialog({ actor: app.actor });
			});
		});
	}
	
	hookActorDirectory() {
		Hooks.on('renderActorDirectory', (app, html, data) => {
			const importButton = $('<button class="import-aurora-list" style="min-width: 96%;"><i class="fas fa-file-import"></i> Aurora Import</button>');
			
			html.find('.import-aurora-list').remove();
			html.find('.directory-footer').append(importButton);
			
			importButton.click(ev =>  {
				ev.preventDefault();
				this.importDialog({ actor: null });
			});
		});
	}
	
	importDialog(options = {}) {
		let out = `
			<p>This is the import dialog.</p>
		`;
		
		let aurora = this.Aurora;
		const d = new Dialog({
			title: "Aurora Character Import",
			content: out,
			buttons: {
				"import": {
					icon: '',
					label: "Import",
					callback: (e) => {
						const file = document.querySelector('.xml-import').files[0];
						if (file) {
							const reader = new FileReader();
							reader.onload = (e) => {
								const characterXml = e.target.result;
								importAuroraActor(aurora.actor(characterXml));
							};
							reader.readAsText(file);
						} else {
							const characterXml = document.querySelector('.xml-data').value;
							importAuroraActor(aurora.actor(characterXml));
						}
					}
				},
				"cancel": {
					icon: '',
					label: "Cancel",
					callback: () => {}
				}
			}
		});
		d.render(true);
	}
	
	exportDialog(options = {}) {
		let out = `
			<p>This is the export dialog.</p>
		`;
		
		let aurora = this.Aurora;
		const d = new Dialog({
			title: "Aurora Character Export",
			content: out,
			buttons: {
				"export": {
					icon: '',
					label: "Export",
					callback: (e) => {
						/*const file = document.querySelector('.json-export').files[0];
						if (file) {
							const reader = new FileReader();
							reader.onload = (e) => {
								const characterData = e.target.result;
								console.log(characterData);
							};
							reader.readAsText(file);
						} else {
							const characterData = document.querySelector('.dbb-data').value;
						}*/
						const xml = aurora.xml(options.actor);
						exportAuroraXml(xml);
					}
				},
				"cancel": {
					icon: '',
					label: "Cancel",
					callback: () => {}
				}
			}
		});
		d.render(true);
	}
	
	importAuroraActor(actor) {
		
	}
	
	exportAuroraXml(xml) {
		const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
        const fileURL = URL.createObjectURL(blob);
        const win = window.open();
        const element = win.document.createElement('a');
        $(element)
            .attr('href', fileURL)
            .attr('download', this.data.actor.data.name.replace(/[^_\-a-z0-9 ]/gi, '')+'.dnd5e');
        win.document.body.appendChild(element);
        element.click();
        setTimeout(() => {win.close();}, 500);
	}
}

let abvtt = new AuroraBuilderVTT();
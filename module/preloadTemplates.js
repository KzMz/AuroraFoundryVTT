export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/AuroraExporter/templates"
	];

	return loadTemplates(templatePaths);
}

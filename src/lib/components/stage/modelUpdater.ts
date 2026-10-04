type ApplyModel<Model> = (updatedModel: Model, previousModel: Model) => void;

/** Applies a model only when it has changed, remembering the one the scene was last built from. */
export function createModelUpdater<Model>(
	initialModel: Model,
	applyModel: ApplyModel<Model>
): (updatedModel: Model) => void {
	let knownModel = initialModel;
	return (updatedModel) => {
		if (updatedModel === knownModel) return;
		const previousModel = knownModel;
		knownModel = updatedModel;
		applyModel(updatedModel, previousModel);
	};
}

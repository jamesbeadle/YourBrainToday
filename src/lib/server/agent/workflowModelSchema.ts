const workflowHandoverSchema = {
	type: 'object',
	required: ['toRole'],
	properties: {
		toRole: { type: 'string' },
		failureNote: {
			type: 'string',
			description: 'What goes wrong or gets delayed at this handover, in the owner’s words.'
		}
	}
};

const workflowTaskSchema = {
	type: 'object',
	required: ['name', 'summary', 'inputs', 'outputs', 'handovers', 'provenance'],
	properties: {
		name: { type: 'string' },
		summary: { type: 'string' },
		inputs: { type: 'array', items: { type: 'string' } },
		outputs: { type: 'array', items: { type: 'string' } },
		handovers: { type: 'array', items: workflowHandoverSchema },
		provenance: {
			type: 'string',
			enum: ['stated', 'inferred'],
			description: 'stated once the owner has said or confirmed it; inferred until then.'
		},
		businessOutput: { type: 'string' }
	}
};

export const workflowModelSchema = {
	type: 'object',
	required: ['businessName', 'externalInputs', 'roles'],
	properties: {
		businessName: { type: 'string' },
		externalInputs: {
			type: 'array',
			items: { type: 'string' },
			description: 'Things that arrive from outside the business and start work off.'
		},
		roles: {
			type: 'array',
			items: {
				type: 'object',
				required: ['name', 'tasks'],
				properties: {
					name: { type: 'string' },
					tasks: { type: 'array', items: workflowTaskSchema }
				}
			}
		}
	}
};

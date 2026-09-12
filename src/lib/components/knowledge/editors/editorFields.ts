export type FieldControl = 'text' | 'textarea' | 'select' | 'datetime' | 'date';

export type FieldOption = { value: string; label: string };

export type FieldSpec = {
	name: string;
	label: string;
	control: FieldControl;
	options?: FieldOption[];
	placeholder?: string;
	isRequired?: boolean;
};

export function titleField(label: string, placeholder = ''): FieldSpec {
	return { name: 'title', label, control: 'text', placeholder, isRequired: true };
}

export function bodyField(label: string, placeholder = ''): FieldSpec {
	return { name: 'body', label, control: 'textarea', placeholder };
}

export function dataField(key: string, label: string, placeholder = ''): FieldSpec {
	return { name: `data.${key}`, label, control: 'text', placeholder };
}

export function dataSelectField(key: string, label: string, names: string[]): FieldSpec {
	return { name: `data.${key}`, label, control: 'select', options: optionsFromNames(names) };
}

export function optionsFromNames(names: string[]): FieldOption[] {
	return names.map((name) => ({ value: name, label: name }));
}

export function dataFrom(item: { data: Record<string, unknown> }, key: string): string {
	const value = item.data[key];
	return typeof value === 'string' ? value : '';
}

export function dataListFrom(item: { data: Record<string, unknown> }, key: string): string[] {
	const value = item.data[key];
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is string => typeof entry === 'string');
}

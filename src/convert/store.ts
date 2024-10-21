class ConversionStore {
	private static instance: ConversionStore;
	private props: Set<string>;
	private flags: Map<string, boolean>;

	private constructor() {
		this.props = new Set();
		this.flags = new Map();
	}

	// Метод для получения единственного экземпляра (синглтона)
	public static getInstance(): ConversionStore {
		if (!ConversionStore.instance) {
			ConversionStore.instance = new ConversionStore();
		}
		return ConversionStore.instance;
	}

	// Методы для управления хранилищем
	public addProp(propName: string) {
		this.props.add(propName);
	}

	public hasProp(propName: string): boolean {
		return this.props.has(propName);
	}

	public setFlag(flagName: string, value: boolean) {
		this.flags.set(flagName, value);
	}

	public getFlag(flagName: string): boolean | undefined {
		return this.flags.get(flagName);
	}

	public clear() {
		this.props.clear();
		this.flags.clear();
	}

	public printStore() {
		console.log('Props:', Array.from(this.props));
		console.log('Flags:', Array.from(this.flags.entries()));
	}
}

export default ConversionStore;
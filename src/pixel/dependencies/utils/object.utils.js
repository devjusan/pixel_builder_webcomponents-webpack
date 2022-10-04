export class ObjectUtils {
	static notEquals(a, b) {
		return !ObjectUtils.equals(a, b);
	}

	static equals(a, b) {
		if (a === b) {
			return true;
		}

		return _.isEqualWith(a, b, customEqualsFn);
	}

	/**
	 * @param {Array<string>} fields
	 *
	 * @returns {boolean}
	 */
	static equalsByFields(a, b, fields) {
		if (a === b) {
			return true;
		}

		let v1, v2;

		let total = fields.length;
		let field;
		for (let i = 0; i < total; ++i) {
			field = fields[i];
			v1 = a[field];
			v2 = b[field];

			if (!ObjectUtils.equals(v1, v2)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @template T
	 * @param {T} obj
	 *
	 * @returns {T}
	 */
	static clone(obj) {
		obj = _.cloneDeepWith(obj, customCloneFn);
		return obj;
	}
}

function customEqualsFn(a2, b2) {
	if (!Array.isArray(a2) || !Array.isArray(b2)) {
		const aIsObject = _.isObject(a2);
		if (aIsObject && typeof a2.equals === "function") {
			return a2.equals(b2);
		}

		const bIsObject = _.isObject(b2);
		if (bIsObject && typeof b2.equals === "function") {
			return b2.equals(a2);
		}
	}
}

function customCloneFn(item) {
	if (typeof item?.clone === "function") {
		return item.clone();
	}
}

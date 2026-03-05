const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;

class ClassTypes {
    #check (methodName, predicate, value) {
        if (!predicate(value)) {
            const actualType = value === null ? "null" : typeof value;
            const actualValue = value === undefined ? "undefined" : `"${String(value)
                .slice(0, 50)}"`;
            throw new TypeError(
                `${methodName} failed: expected ${this.#getExpectedType(methodName)}, got ${actualType} ${actualValue}`,
            );
        }
        return value;
    }

    #getExpectedType (methodName) {
        const types = {
            "isaPositiveInt": "positive integer",
            "isaEmailAddress": "email address",
            "isaString": "string",
            "isaNumber": "number",
            "isaBoolean": "boolean",
            "isaDate": "date",
            "isaURL": "URL",
            "isaArray": "array",
            "isaObject": "object",
            "isaAnyOf": "any of",
            "isaAllOf": "all of",
            "isaNoneOf": "none of",
            "maybe": "optional",
        };
        return types[methodName] || "unknown type";
    }

    validate (name, value, methodName, ...extraArgs) {
        const method = this[methodName];
        if (typeof method !== "function") {
            throw new TypeError(`Unknown method: ${methodName}`);
        }
        return method.call(this, ...extraArgs, value);
    }

    isaPositiveInt (value) {
        return this.#check(
            "isaPositiveInt",
            (v) => Number.isInteger(v) && v >= 1,
            value,
        );
    }

    isaEmailAddress (value) {
        return this.#check(
            "isaEmailAddress",
            (v) => typeof v === "string" && EMAIL_REGEX.test(v),
            value,
        );
    }

    isaString (value) {
        return this.#check(
            "isaString",
            (v) => typeof v === "string",
            value,
        );
    }

    isaNumber (value) {
        return this.#check(
            "isaNumber",
            (v) => typeof v === "number" && !isNaN(v),
            value,
        );
    }

    isaBoolean (value) {
        return this.#check(
            "isaBoolean",
            (v) => typeof v === "boolean",
            value,
        );
    }

    isaDate (value) {
        return this.#check(
            "isaDate",
            (v) => v instanceof Date && !isNaN(v.getTime()),
            value,
        );
    }

    isaURL (value) {
        return this.#check(
            "isaURL",
            (v) => {
                if (typeof v !== "string") return false;
                try {
                    new URL(v);
                    return URL_REGEX.test(v);
                } catch {
                    return false;
                }
            },
            value,
        );
    }

    isaArray (value) {
        return this.#check(
            "isaArray",
            (v) => Array.isArray(v),
            value,
        );
    }

    isaObject (value) {
        return this.#check(
            "isaObject",
            (v) => typeof v === "object" && v !== null && !Array.isArray(v),
            value,
        );
    }

    isaAnyOf (typeMethods, value) {
        return this.#check(
            "isaAnyOf",
            (v) => {
                for (const method of typeMethods) {
                    try {
                        this[method](v);
                        return true;
                    } catch (e) {
                        if (!(e instanceof TypeError)) {
                            throw e;
                        }
                    }
                }
                return false;
            },
            value,
        );
    }

    isaAllOf (typeMethods, value) {
        return this.#check(
            "isaAllOf",
            (v) => {
                for (const method of typeMethods) {
                    try {
                        this[method](v);
                    } catch (e) {
                        if (!(e instanceof TypeError)) {
                            throw e;
                        }
                        return false;
                    }
                }
                return true;
            },
            value,
        );
    }

    isaNoneOf (typeMethods, value) {
        return this.#check(
            "isaNoneOf",
            (v) => {
                for (const method of typeMethods) {
                    try {
                        this[method](v);
                        return false;
                    } catch (e) {
                        if (!(e instanceof TypeError)) {
                            throw e;
                        }
                    }
                }
                return true;
            },
            value,
        );
    }

    maybe (methodName, value) {
        if (value === null || value === undefined) {
            return value;
        }
        const method = this[methodName];
        if (typeof method !== "function") {
            throw new TypeError(`Unknown method: ${methodName}`);
        }
        return method.call(this, value);
    }
}

module.exports = ClassTypes;

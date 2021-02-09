import Redis from "ioredis";
import setting from "lib/misc/setting";
import logger from "lib/misc/logger";

const options = {
	...setting.redis,
	retryStrategy: () => {
		// var delay = Math.min(times * 50, 2000);
		// return delay;
		return undefined;
	},
};

const redisClient = new Redis(options);
const redisClientBIO = new Redis(options); // for block io
const redisClientPub = new Redis(options);
const redisClientSub = new Redis(options);

/**
 * when the status is connecting, it is ok to get or set, as the command will be queued.
 */
const REDIS_STATUS_OK = ["connecting", "ready"];

// facade for accessing direct keys
const myRedis = {
	on: (event, callback) => {
		try {
			redisClient.on(event, () => callback());
		} catch (e) {
			// do nothing
		}
	},
	remove: (key, isPattern, filterPredicate = () => true) => {
		try {
			// prevent unnecessary attempt
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return;
			if (isPattern) {
				redisClient.keys(key).then((keys) => {
					// Use pipeline instead of sending
					// one command each time to improve the
					// performance.
					const pipeline = redisClient.pipeline();

					keys.filter(filterPredicate).forEach((k) => {
						pipeline.del(k);
					});
					return pipeline.exec();
				});
			} else {
				redisClient.remove(key);
			}
		} catch (e) {
			// do nothing
		}
	},
	hset: (key, field, value) => {
		try {
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return;
			redisClient.hset(key, field, value);
		} catch (e) {
			// do nothing
		}
	},
	hgetall: async (key) => {
		try {
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return null;
			const result = await redisClient.hgetall(key);
			// trans [f1, v1, f2, v2] -> {f1: v1, f2: v2}
			if (Array.isArray(result)) {
				const obj = {};
				for (let i = 0; i < result.length; i += 2) {
					obj[result[i]] = result[i + 1];
				}
				return obj;
			}
			return result;
		} catch (e) {
			// do nothing
		}
		return null;
	},
	hget: async (key, field) => {
		try {
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return null;
			return await redisClient.hget(key, field);
		} catch (e) {
			// do nothing
		}
		return null;
	},

	hdel: (key, fields) => {
		try {
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return;
			redisClient.hdel(key, ...fields);
		} catch (e) {
			// do nothing
		}
	},
	// json wrapper set
	set: (key, value, expiraryInSeconds) => {
		try {
			// prevent unnecessary attempt
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return;
			if (expiraryInSeconds) {
				redisClient.set(key, JSON.stringify(value), "ex", expiraryInSeconds);
			} else {
				redisClient.set(key, JSON.stringify(value));
			}
		} catch (e) {
			// do nothing
		}
	},
	// json wrapper get
	get: async (key) => {
		if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) {
			return null;
		}
		let value = null;
		try {
			value = await redisClient.get(key);
		} catch (e) {
			// do nothing
		}
		return value != null ? JSON.parse(value) : null;
	},
	// broadcast pub
	pub: (triggerName, payload) => {
		redisClientPub.publish(triggerName, JSON.stringify(payload));
	},
	sub: (triggerName, cb) => {
		redisClientSub.on("message", (channel, message) => {
			if (triggerName === channel) {
				cb(message); // JSON.parse(message)
			}
		});
		redisClientSub.subscribe(triggerName, (err) => {
			if (err) {
				logger.error(err);
			}
		});
	},
	pubSingle: (triggerName, payload) => {
		// add to the tail
		redisClient.rpush(triggerName, JSON.stringify(payload)).then((size) => {
			if (size > 0) {
				redisClientPub.publish(triggerName, new Date());
			}
		});
	},
	lpopAll: async (triggerName, cb) => {
		const datas = [];
		let data = null;
		// eslint-disable-next-line no-constant-condition
		do {
			// eslint-disable-next-line no-await-in-loop
			data = await redisClient.lpop(triggerName);
			data !== null && datas.push(JSON.parse(data));
		} while (data !== null);
		cb(datas);
	},
	subSingle: (triggerName, pattern = false, cb) => {
		redisClientSub.on(pattern ? "pmessage" : "message", (channel) => {
			if (triggerName === channel) {
				// eat from the head
				redisClient.lpop(triggerName).then((v) => {
					cb(v !== null ? JSON.parse(v) : v); // JSON.parse(message)
				});
			}
		});
		if (pattern) {
			redisClientSub.psubscribe(triggerName, (err) => {
				if (err) {
					logger.error(err);
				}
			});
		} else {
			redisClientSub.subscribe(triggerName, (err) => {
				if (err) {
					logger.error(err);
				}
			});
		}
	},
	lpush: (key, value) => {
		try {
			// prevent unnecessary attempt
			if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) return;
			redisClient.lpush(key, JSON.stringify(value));
		} catch (e) {
			// do nothing
		}
	},
	brpop: async (key, timeout = 3) => {
		// if (REDIS_STATUS_OK.indexOf(redisClient.status) === -1) {
		//   return null;
		// }
		try {
			const [, value] = await redisClientBIO.brpop(key, timeout);
			return value != null ? JSON.parse(value) : null;
		} catch (e) {
			// do nothing
		}
		return null;
	},
	flushall: async () => {
		try {
			await redisClient.flushall();
		} catch (e) {
			// do nothing
		}
	},
	sadd: async (key, value) => {
		try {
			await redisClient.sadd(key, value);
		} catch (e) {
			// do nothing
		}
	},
	srem: async (key, value) => {
		try {
			await redisClient.srem(key, value);
		} catch (e) {
			// do nothing
		}
	},
	sscan: async (key, patternValue) => {
		try {
			const items = await redisClient.sscan(key, 0, "match", patternValue);
			return items[1];
		} catch (e) {
			// do nothing
			return [];
		}
	},
};

export { myRedis, redisClient };

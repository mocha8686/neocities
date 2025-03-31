import dayjs from 'dayjs';

type Dated<DateKey extends string> = {
	data: {
		[key in DateKey]: Date;
	};
};

export default function getLatestEntry<
	DateKey extends string,
	T extends Dated<DateKey>,
>(collection: T[], dateKey: DateKey) {
	type Unpacked<T> = T extends (infer U)[] ? U : T;

	const latest = collection.reduce<Unpacked<typeof collection> | null>(
		(prev, current) =>
			prev && dayjs(prev.data[dateKey]).isAfter(dayjs(current.data[dateKey]))
				? prev
				: (current ?? current),
		null,
	);

	if (!latest) throw new Error("Collection should be populated");

	return latest;
}

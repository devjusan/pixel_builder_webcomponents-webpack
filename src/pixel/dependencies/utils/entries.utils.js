export default class EntriesUtils {
  constructor() {
    throw new Error('EntriesUtils cannot be instantiated');
  }

  static getEntries(fieldEntriesMap) {
    let entries = {};
    const entriesPair = Object.entries(fieldEntriesMap);

    entriesPair.forEach(([key, value]) => {
      if (!value?.props) {
        return;
      }

      const {
        props: { description },
        id,
      } = value;
      const inputEl = document.getElementById(id).querySelector('input');
      const descriptionLowered = description.toLowerCase();

      entries[descriptionLowered] = inputEl.value;
    });

    return entries;
  }
}

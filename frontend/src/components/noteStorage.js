const NOTES_KEY = "healthspeak_notes_entries";

export function getSavedEntries() {
  const raw = localStorage.getItem(NOTES_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(entries));
}

export function addFavoriteTerm(termData) {
  const entries = getSavedEntries();

  const alreadyExists = entries.some(
    (entry) =>
      entry.type === "favorite" &&
      entry.title?.toLowerCase() === termData.term.toLowerCase()
  );

  if (alreadyExists) {
    return { added: false, entries };
  }

  const newEntry = {
    id: crypto.randomUUID(),
    type: "favorite",
    title: termData.term,
    content: termData.definition || "",
    createdAt: new Date().toISOString(),
    symptoms: termData.symptoms || [],
    causes: termData.causes || [],
  };

  const updated = [newEntry, ...entries];
  saveEntries(updated);

  return { added: true, entries: updated };
}

export function removeFavoriteTerm(term) {
  const entries = getSavedEntries().filter(
    (entry) =>
      !(
        entry.type === "favorite" &&
        entry.title?.toLowerCase() === term.toLowerCase()
      )
  );

  saveEntries(entries);
  return entries;
}

export function isTermFavorited(term) {
  return getSavedEntries().some(
    (entry) =>
      entry.type === "favorite" &&
      entry.title?.toLowerCase() === term.toLowerCase()
  );
}

export function addManualNote(title, content) {
  const entries = getSavedEntries();

  const newEntry = {
    id: crypto.randomUUID(),
    type: "manual",
    title: title || "Untitled note",
    content,
    createdAt: new Date().toISOString(),
  };

  const updated = [newEntry, ...entries];
  saveEntries(updated);
  return updated;
}

export function deleteEntry(id) {
  const updated = getSavedEntries().filter((entry) => entry.id !== id);
  saveEntries(updated);
  return updated;
}

export function updateEntry(id, updates) {
  const updated = getSavedEntries().map((entry) =>
    entry.id === id
      ? {
          ...entry,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : entry
  );

  saveEntries(updated);
  return updated;
}
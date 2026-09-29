export const appearance = {
  michael: {
    hair: "#51392e",
    eyes: "#654329",
    skin: "#dca879",
    jeans: "#526d86",
    rice: "#29465d",
    sweater: "#b3674f", // Rust henley; retain the stored outfit key for compatibility.
  },
  bella: { coat: "#c89c65", light: "#f0d9ad", ears: "#875b3d" }, // Provisional honey / cream coat. Edit here.
};
export const portfolio = {
  name: "Michael Gonzalez McNeil",
  email: "mg188@rice.edu", // Supplied in the existing repository.
  links: [] as { label: string; href: string }[], // Add verified https:// links here.
};
export type Preferences = { outfit: "rice" | "sweater"; sound: boolean };
export function readPreferences(
  storage: Pick<Storage, "getItem">,
): Preferences {
  try {
    const value = JSON.parse(
      storage.getItem("north-beach-preferences") || "{}",
    );
    return {
      outfit: value?.outfit === "sweater" ? "sweater" : "rice",
      sound: value?.sound === true,
    };
  } catch {
    return { outfit: "rice", sound: false };
  }
}
export function savePreferences(
  storage: Pick<Storage, "setItem">,
  value: Preferences,
) {
  try {
    storage.setItem("north-beach-preferences", JSON.stringify(value));
  } catch {
    /* Private browsing is welcome. */
  }
}

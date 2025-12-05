import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BackgroundType = "color" | "preset";

interface ThemeState {
  backgroundType: BackgroundType; // тип фона: цвет или preset
  backgroundValue: string; // цвет HEX или название пресета
}

const initialState: ThemeState = {
  backgroundType: "preset",
  backgroundValue: "snow", // белый по умолчанию
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setBackgroundType: (state, action: PayloadAction<BackgroundType>) => {
      state.backgroundType = action.payload;
    },
    setBackgroundValue: (state, action: PayloadAction<string>) => {
      state.backgroundValue = action.payload;
    },
    // Удобный редьюсер для выбора любого background (цвет или preset)
    setBackground: (
      state,
      action: PayloadAction<{ type: BackgroundType; value: string }>
    ) => {
      state.backgroundType = action.payload.type;
      state.backgroundValue = action.payload.value;
    },
  },
});

export const { setBackgroundType, setBackgroundValue, setBackground } =
  themeSlice.actions;
export default themeSlice.reducer;

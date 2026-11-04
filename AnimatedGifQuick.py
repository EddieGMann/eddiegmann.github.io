import os
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageDraw, ImageFont, ImageTk, ImageOps

APP_TITLE = "Animated GIF Studio"
OUTPUT_W = 900
CAPTION_H = 76
BG = (31, 35, 42)
DIRECT = "Direct to next step"
OVERVIEW = "Return to overview"
STAY = "Stay on this detail"
TRANSITIONS = [DIRECT, OVERVIEW, STAY]


class AnimatedGifStudio:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("800x500")
        self.root.minsize(520, 380)

        self.current_image = None
        self.current_path = None
        self.preview_photo = None
        self.steps = []
        self.preview_target = (0.5, 0.5)

        self.caption_var = tk.StringVar()
        self.zoom_var = tk.DoubleVar(value=2.0)
        self.hold_var = tk.DoubleVar(value=1.0)
        self.transition_var = tk.StringVar(value=DIRECT)
        self.intro_var = tk.DoubleVar(value=1.0)
        self.move_var = tk.DoubleVar(value=0.6)
        self.fps_var = tk.IntVar(value=12)
        self.opening_caption_var = tk.StringVar(value="")

        self._build_ui()
        self._refresh_list()

    def _build_ui(self):
        top = ttk.Frame(self.root, padding=8)
        top.pack(fill="x")
        ttk.Button(top, text="Open Screenshot...", command=self.open_screenshot).pack(side="left")
        ttk.Label(top, text="Open an image, click the target, then add a step.").pack(
            side="left", padx=10
        )

        body = ttk.Frame(self.root, padding=(8, 0, 8, 8))
        body.pack(fill="both", expand=True)

        left = ttk.Frame(body)
        left.pack(side="left", fill="both", expand=True)

        self.canvas = tk.Canvas(
            left, width=520, height=300, background="#20242a",
            highlightthickness=1, highlightbackground="#555"
        )
        self.canvas.pack(fill="both", expand=True)
        self.canvas.bind("<Button-1>", self.on_canvas_click)
        self.target_marker = None

        ttk.Label(
            left,
            text="Click the preview to choose where the camera should zoom in.",
            wraplength=500
        ).pack(anchor="w", pady=(5, 8))

        right_outer = ttk.Frame(body, width=350)
        right_outer.pack(side="right", fill="y", padx=(8, 0))
        right_outer.pack_propagate(False)

        right_canvas = tk.Canvas(right_outer, width=330, highlightthickness=0)
        right_scrollbar = ttk.Scrollbar(
            right_outer, orient="vertical", command=right_canvas.yview
        )
        right_canvas.configure(yscrollcommand=right_scrollbar.set)

        right_scrollbar.pack(side="right", fill="y")
        right_canvas.pack(side="left", fill="both", expand=True)

        right = ttk.Frame(right_canvas)
        right_window = right_canvas.create_window(
            (0, 0), window=right, anchor="nw"
        )

        def update_scroll_region(_event=None):
            right_canvas.configure(scrollregion=right_canvas.bbox("all"))

        def resize_right_panel(event):
            right_canvas.itemconfigure(right_window, width=event.width)

        right.bind("<Configure>", update_scroll_region)
        right_canvas.bind("<Configure>", resize_right_panel)

        ttk.Label(right, text="Tutorial steps", font=("Segoe UI", 11, "bold")).pack(anchor="w")
        list_frame = ttk.Frame(right)
        list_frame.pack(fill="x", pady=(4, 5))
        self.step_list = tk.Listbox(list_frame, height=8, exportselection=False)
        self.step_list.pack(side="left", fill="both", expand=True)
        self.step_list.bind("<<ListboxSelect>>", self.on_select_step)
        scroll = ttk.Scrollbar(list_frame, orient="vertical", command=self.step_list.yview)
        scroll.pack(side="right", fill="y")
        self.step_list.configure(yscrollcommand=scroll.set)

        buttons = ttk.Frame(right)
        buttons.pack(fill="x", pady=(0, 8))
        ttk.Button(buttons, text="Add Step", command=self.add_step).grid(row=0, column=0, sticky="ew", padx=2, pady=2)
        ttk.Button(buttons, text="Replace Image...", command=self.replace_selected_image).grid(row=0, column=1, sticky="ew", padx=2, pady=2)
        ttk.Button(buttons, text="Up", command=lambda: self.move_step(-1)).grid(row=1, column=0, sticky="ew", padx=2, pady=2)
        ttk.Button(buttons, text="Down", command=lambda: self.move_step(1)).grid(row=1, column=1, sticky="ew", padx=2, pady=2)
        ttk.Button(buttons, text="Remove Step", command=self.remove_step).grid(row=2, column=0, columnspan=2, sticky="ew", padx=2, pady=2)
        buttons.columnconfigure(0, weight=1)
        buttons.columnconfigure(1, weight=1)

        settings = ttk.LabelFrame(right, text="Selected step settings", padding=8)
        settings.pack(fill="x", pady=(0, 8))

        ttk.Label(settings, text="Caption").grid(row=0, column=0, sticky="w")
        ttk.Entry(settings, textvariable=self.caption_var).grid(row=1, column=0, columnspan=2, sticky="ew", pady=(2, 6))

        ttk.Label(settings, text="Zoom level").grid(row=2, column=0, sticky="w")
        ttk.Spinbox(settings, from_=1.2, to=5.0, increment=0.2, textvariable=self.zoom_var, width=8).grid(row=2, column=1, sticky="e")

        ttk.Label(settings, text="Close-up hold (seconds)").grid(row=3, column=0, sticky="w", pady=(5, 0))
        ttk.Spinbox(settings, from_=0.2, to=10.0, increment=0.2, textvariable=self.hold_var, width=8).grid(row=3, column=1, sticky="e", pady=(5, 0))

        ttk.Label(settings, text="Transition after this step").grid(row=4, column=0, sticky="w", pady=(7, 0))
        self.transition_box = ttk.Combobox(
            settings, textvariable=self.transition_var, values=TRANSITIONS,
            state="readonly", width=22
        )
        self.transition_box.grid(row=5, column=0, columnspan=2, sticky="ew", pady=(2, 6))

        ttk.Button(settings, text="Update Selected Step", command=self.update_step).grid(
            row=6, column=0, columnspan=2, sticky="ew", pady=(3, 0)
        )
        settings.columnconfigure(0, weight=1)

        export = ttk.LabelFrame(right, text="Animation settings", padding=8)
        export.pack(fill="x")
        ttk.Label(export, text="Opening overview hold (seconds)").grid(row=0, column=0, sticky="w")
        ttk.Spinbox(export, from_=0, to=10, increment=0.2, textvariable=self.intro_var, width=8).grid(row=0, column=1, sticky="e")
        ttk.Label(export, text="Movement duration (seconds)").grid(row=1, column=0, sticky="w", pady=(5, 0))
        ttk.Spinbox(export, from_=0.2, to=3, increment=0.1, textvariable=self.move_var, width=8).grid(row=1, column=1, sticky="e", pady=(5, 0))
        ttk.Label(export, text="Frames per second").grid(row=2, column=0, sticky="w", pady=(5, 0))
        ttk.Spinbox(export, from_=5, to=24, increment=1, textvariable=self.fps_var, width=8).grid(row=2, column=1, sticky="e", pady=(5, 0))
        ttk.Label(export, text="Opening caption (optional)").grid(row=3, column=0, sticky="w", pady=(5, 0))
        ttk.Entry(export, textvariable=self.opening_caption_var).grid(row=4, column=0, columnspan=2, sticky="ew", pady=(2, 6))
        ttk.Button(export, text="Export Animated GIF...", command=self.export_gif).grid(
            row=5, column=0, columnspan=2, sticky="ew", pady=(4, 0)
        )
        export.columnconfigure(0, weight=1)

    def open_screenshot(self):
        path = filedialog.askopenfilename(
            title="Open screenshot",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.bmp *.webp"), ("All files", "*.*")]
        )
        if not path:
            return
        try:
            image = Image.open(path).convert("RGB")
        except Exception as exc:
            messagebox.showerror("Could not open image", str(exc))
            return
        self.current_image = image
        self.current_path = path
        self.preview_target = (0.5, 0.5)
        self.show_preview()

    def show_preview(self):
        self.canvas.delete("all")
        if self.current_image is None:
            self.canvas.create_text(250, 140, text="Open a screenshot to begin", fill="white")
            return
        width = max(1, self.canvas.winfo_width())
        height = max(1, self.canvas.winfo_height())
        display = self.current_image.resize((width, height), Image.Resampling.LANCZOS)
        self.preview_photo = ImageTk.PhotoImage(display)
        self.canvas.create_image(0, 0, image=self.preview_photo, anchor="nw")
        x = self.preview_target[0] * width
        y = self.preview_target[1] * height
        self.canvas.create_oval(x-8, y-8, x+8, y+8, outline="#ff4040", width=3)
        self.canvas.create_line(x-14, y, x+14, y, fill="#ff4040", width=2)
        self.canvas.create_line(x, y-14, x, y+14, fill="#ff4040", width=2)

    def on_canvas_click(self, event):
        width = max(1, self.canvas.winfo_width())
        height = max(1, self.canvas.winfo_height())
        self.preview_target = (
            min(1.0, max(0.0, event.x / width)),
            min(1.0, max(0.0, event.y / height))
        )
        self.show_preview()

    def selected_index(self):
        selected = self.step_list.curselection()
        return selected[0] if selected else None

    def _refresh_list(self, select=None):
        self.step_list.delete(0, "end")
        for i, step in enumerate(self.steps):
            filename = os.path.basename(step["path"]) if step["path"] else "screenshot"
            self.step_list.insert("end", f"{i+1}. {step['caption'] or '(no caption)'} [{filename}]")
        if select is not None and self.steps:
            select = max(0, min(select, len(self.steps)-1))
            self.step_list.selection_set(select)
            self.step_list.activate(select)
            self.load_step_settings(select)

    def on_select_step(self, _event=None):
        index = self.selected_index()
        if index is None or index >= len(self.steps):
            return
        step = self.steps[index]
        self.current_image = step["image"].copy()
        self.current_path = step["path"]
        self.preview_target = (step["x"], step["y"])
        self.caption_var.set(step["caption"])
        self.zoom_var.set(step["zoom"])
        self.hold_var.set(step["hold"])
        self.transition_var.set(step["transition"])
        self.show_preview()

    def load_step_settings(self, index):
        self.step_list.selection_clear(0, "end")
        self.step_list.selection_set(index)
        self.on_select_step()

    def add_step(self):
        if self.current_image is None:
            messagebox.showinfo("Open a screenshot", "Open a screenshot before adding a step.")
            return
        caption = self.caption_var.get().strip()
        step = {
            "image": self.current_image.copy(),
            "path": self.current_path or "",
            "x": self.preview_target[0],
            "y": self.preview_target[1],
            "caption": caption,
            "zoom": float(self.zoom_var.get()),
            "hold": float(self.hold_var.get()),
            "transition": self.transition_var.get() or DIRECT,
        }
        self.steps.append(step)
        self._refresh_list(len(self.steps)-1)

    def update_step(self):
        index = self.selected_index()
        if index is None:
            messagebox.showinfo("Select a step", "Select a step to update.")
            return
        if self.current_image is None:
            return
        self.steps[index].update({
            "image": self.current_image.copy(),
            "path": self.current_path or "",
            "x": self.preview_target[0],
            "y": self.preview_target[1],
            "caption": self.caption_var.get().strip(),
            "zoom": float(self.zoom_var.get()),
            "hold": float(self.hold_var.get()),
            "transition": self.transition_var.get() or DIRECT,
        })
        self._refresh_list(index)

    def replace_selected_image(self):
        index = self.selected_index()
        if index is None:
            messagebox.showinfo("Select a step", "Select a step first.")
            return
        path = filedialog.askopenfilename(
            title="Replace selected step screenshot",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.bmp *.webp"), ("All files", "*.*")]
        )
        if not path:
            return
        try:
            image = Image.open(path).convert("RGB")
        except Exception as exc:
            messagebox.showerror("Could not open image", str(exc))
            return
        self.current_image = image
        self.current_path = path
        self.preview_target = (0.5, 0.5)
        self.show_preview()
        self.update_step()

    def remove_step(self):
        index = self.selected_index()
        if index is None:
            return
        del self.steps[index]
        self._refresh_list(min(index, len(self.steps)-1) if self.steps else None)
        if not self.steps:
            self.current_image = None
            self.current_path = None
            self.show_preview()

    def move_step(self, delta):
        index = self.selected_index()
        if index is None:
            return
        new_index = index + delta
        if new_index < 0 or new_index >= len(self.steps):
            return
        self.steps[index], self.steps[new_index] = self.steps[new_index], self.steps[index]
        self._refresh_list(new_index)

    def _make_canvas_images(self):
        first = self.steps[0]["image"]
        ratio = first.height / max(1, first.width)
        out_h = max(400, min(700, int(OUTPUT_W * ratio)))
        prepared = []
        for step in self.steps:
            source = step["image"].convert("RGB")
            fitted = ImageOps.contain(source, (OUTPUT_W, out_h), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (OUTPUT_W, out_h), BG)
            canvas.paste(fitted, ((OUTPUT_W-fitted.width)//2, (out_h-fitted.height)//2))
            prepared.append(canvas)
        return prepared, out_h

    def _camera(self, image, x, y, zoom):
        width, height = image.size
        zoom = max(1.0, float(zoom))
        crop_w = max(1, int(width / zoom))
        crop_h = max(1, int(height / zoom))
        center_x = min(width, max(0, x * width))
        center_y = min(height, max(0, y * height))
        left = int(center_x - crop_w / 2)
        top = int(center_y - crop_h / 2)
        left = max(0, min(width-crop_w, left))
        top = max(0, min(height-crop_h, top))
        crop = image.crop((left, top, left+crop_w, top+crop_h))
        return crop.resize((width, height), Image.Resampling.LANCZOS)

    def _caption_frame(self, image, caption):
        frame = Image.new("RGB", (image.width, image.height + CAPTION_H), BG)
        frame.paste(image, (0, 0))
        draw = ImageDraw.Draw(frame)
        font = None
        for name in ("arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
            try:
                font = ImageFont.truetype(name, 25)
                break
            except OSError:
                pass
        if font is None:
            font = ImageFont.load_default()
        text = (caption or "").strip()
        max_width = image.width - 36
        while text and draw.textbbox((0, 0), text, font=font)[2] > max_width:
            text = text[:-2].rstrip() + "…"
        box = draw.textbbox((0, 0), text, font=font)
        tw = box[2] - box[0]
        th = box[3] - box[1]
        draw.text(((image.width-tw)//2, image.height+(CAPTION_H-th)//2-3), text, font=font, fill="white")
        return frame

    def export_gif(self):
        if not self.steps:
            messagebox.showinfo("No steps", "Add at least one tutorial step first.")
            return
        path = filedialog.asksaveasfilename(
            title="Export animated GIF",
            defaultextension=".gif",
            filetypes=[("Animated GIF", "*.gif")]
        )
        if not path:
            return
        try:
            fps = max(5, min(24, int(self.fps_var.get())))
            move_frames = max(2, int(float(self.move_var.get()) * fps))
            prepared, _ = self._make_canvas_images()
            frames = []

            def add_frame(image, caption, count=1):
                rendered = self._caption_frame(image, caption)
                for _ in range(max(1, count)):
                    frames.append(rendered.copy())

            def animate_camera(image, start, end, caption, count):
                for n in range(1, count+1):
                    t = n / count
                    x = start[0] + (end[0]-start[0]) * t
                    y = start[1] + (end[1]-start[1]) * t
                    z = start[2] + (end[2]-start[2]) * t
                    add_frame(self._camera(image, x, y, z), caption)

            def crossfade(old_image, new_image, old_camera, new_camera, caption, count):
                for n in range(1, count+1):
                    t = n / count
                    old_frame = self._camera(old_image, *old_camera)
                    new_frame = self._camera(new_image, *new_camera)
                    add_frame(Image.blend(old_frame, new_frame, t), caption)

            first = self.steps[0]
            overview_caption = self.opening_caption_var.get().strip()
            add_frame(prepared[0], overview_caption, int(max(0, float(self.intro_var.get())) * fps))
            first_camera = (first["x"], first["y"], first["zoom"])
            animate_camera(prepared[0], (0.5, 0.5, 1.0), first_camera, first["caption"], move_frames)

            for i, step in enumerate(self.steps):
                current_image = prepared[i]
                current_camera = (step["x"], step["y"], step["zoom"])
                add_frame(self._camera(current_image, *current_camera), step["caption"],
                          int(max(0.2, float(step["hold"])) * fps))

                if i == len(self.steps)-1:
                    if step["transition"] == OVERVIEW:
                        animate_camera(current_image, current_camera, (0.5, 0.5, 1.0),
                                       step["caption"], move_frames)
                    elif step["transition"] == STAY:
                        add_frame(self._camera(current_image, *current_camera), step["caption"], fps)
                    continue

                next_step = self.steps[i+1]
                next_image = prepared[i+1]
                next_camera = (next_step["x"], next_step["y"], next_step["zoom"])
                mode = step["transition"]

                if mode == STAY:
                    add_frame(self._camera(current_image, *current_camera), step["caption"], fps)

                if mode == OVERVIEW:
                    animate_camera(current_image, current_camera, (0.5, 0.5, 1.0),
                                   step["caption"], move_frames)
                    if step["path"] != next_step["path"]:
                        crossfade(current_image, next_image, (0.5, 0.5, 1.0),
                                  (0.5, 0.5, 1.0), next_step["caption"], move_frames)
                    animate_camera(next_image, (0.5, 0.5, 1.0), next_camera,
                                   next_step["caption"], move_frames)
                else:
                    if step["path"] == next_step["path"]:
                        animate_camera(current_image, current_camera, next_camera,
                                       next_step["caption"], move_frames)
                    else:
                        crossfade(current_image, next_image, current_camera, next_camera,
                                  next_step["caption"], move_frames)

            if not frames:
                raise RuntimeError("No frames were created.")
            duration = max(1, int(1000 / fps))
            frames[0].save(
                path, save_all=True, append_images=frames[1:], duration=duration,
                loop=0, optimize=True, disposal=2
            )
            messagebox.showinfo("Export complete", f"Animated GIF saved to:\n{path}")
        except Exception as exc:
            messagebox.showerror("Export failed", f"{exc}\n\nYour project and backup are unchanged.")


def main():
    root = tk.Tk()
    app = AnimatedGifStudio(root)

    def resize_preview(_event=None):
        if app.current_image is not None:
            app.show_preview()

    app.canvas.bind("<Configure>", resize_preview)
    root.mainloop()


if __name__ == "__main__":
    main()

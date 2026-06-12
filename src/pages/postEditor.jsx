import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import EmojiPicker from "emoji-picker-react";
import {
  FiX,
  FiType,
  FiImage,
  FiSmile,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";

export default function PostEditor() {
  const fileRef = useRef();

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);

  const [layers, setLayers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const [textInput, setTextInput] = useState("");

  // IMAGE
  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  // ADD TEXT (NO BOX FEEL ANYMORE)
  const addText = () => {
    const id = Date.now();

    setLayers((prev) => [
      ...prev,
      {
        id,
        type: "text",
        text: "Tap to edit",
        x: 100,
        y: 150,
        fontSize: 30,
        color: "#fff",
      },
    ]);

    setSelected(id);
  };

  // ADD MULTIPLE EMOJIS (FIXED)
  const addEmoji = (emojiData) => {
    const id = Date.now();

    setLayers((prev) => [
      ...prev,
      {
        id,
        type: "emoji",
        text: emojiData.emoji,
        x: 120 + Math.random() * 50,
        y: 180 + Math.random() * 50,
        fontSize: 20, // small emoji
      },
    ]);
  };

  // UPDATE
  const updateLayer = (id, changes) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...changes } : l))
    );
  };

  // DELETE
  const deleteLayer = () => {
    if (!selected) return;
    setLayers((prev) => prev.filter((l) => l.id !== selected));
    setSelected(null);
  };

  // EDIT TEXT MODE (FIXED UX)
  const selectedLayer = layers.find((l) => l.id === selected);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      {/* OPEN */}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-full"
      >
        Create Post
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* TOP */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
            <button onClick={() => setOpen(false)}>
              <FiX className="text-white" size={24} />
            </button>

            <h1 className="text-white font-semibold">
              Create Post
            </h1>

            <button className="text-green-500 flex items-center gap-1">
              <FiCheck /> Done
            </button>
          </div>

          {/* CANVAS */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="relative w-full max-w-[500px] h-full overflow-hidden">
              {/* IMAGE */}
              {image && (
                <img
                  src={image}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* LAYERS (NO TEXT CONTAINER FEEL) */}
              {layers.map((layer) => (
                <Rnd
                  key={layer.id}
                  bounds="parent"
                  position={{ x: layer.x, y: layer.y }}
                  enableResizing={false}
                  onDragStop={(e, d) => {
                    updateLayer(layer.id, {
                      x: d.x,
                      y: d.y,
                    });
                  }}
                  onClick={() => setSelected(layer.id)}
                >
                  {layer.type === "text" ? (
                    <div
                      onDoubleClick={() =>
                        setTextInput(layer.text)
                      }
                      className="text-white font-bold select-none"
                      style={{
                        fontSize: layer.fontSize,
                        textShadow:
                          "0 2px 8px rgba(0,0,0,0.8)",
                      }}
                    >
                      {layer.text}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: layer.fontSize,
                      }}
                    >
                      {layer.text}
                    </div>
                  )}
                </Rnd>
              ))}
            </div>
          </div>

          {/* FLOATING TEXT EDITOR (FIXED UX) */}
          {selectedLayer?.type === "text" && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 p-2 rounded-xl flex gap-2">
              <input
                value={selectedLayer.text}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    text: e.target.value,
                  })
                }
                className="bg-transparent text-white outline-none px-2"
              />
            </div>
          )}

          {/* EMOJI PICKER */}
          {showEmoji && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 scale-90">
              <EmojiPicker
                theme="dark"
                onEmojiClick={addEmoji}
              />
            </div>
          )}

          {/* TOOLBAR */}
          <div className="h-16 bg-black border-t border-white/10 flex justify-around items-center">
            <button
              onClick={addText}
              className="text-white flex flex-col items-center"
            >
              <FiType />
              <span className="text-xs">Text</span>
            </button>

            <button
              onClick={() => fileRef.current.click()}
              className="text-white flex flex-col items-center"
            >
              <FiImage />
              <span className="text-xs">Photo</span>
            </button>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              onChange={uploadImage}
            />

            {/* EMOJI CAN ADD MANY TIMES NOW */}
            <button
              onClick={() =>
                setShowEmoji((p) => !p)
              }
              className="text-white flex flex-col items-center"
            >
              <FiSmile />
              <span className="text-xs">Emoji</span>
            </button>

            <button
              onClick={deleteLayer}
              className="text-red-500 flex flex-col items-center"
            >
              <FiTrash2 />
              <span className="text-xs">Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
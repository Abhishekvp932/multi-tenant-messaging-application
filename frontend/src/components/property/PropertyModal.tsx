// components/property/PropertyModal.tsx

import { useRef, useEffect, useCallback, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Trash2 } from "lucide-react";
import type { CreatePropertyInput, Property } from "@/types/propertyTypes";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface PropertyModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreatePropertyInput) => void;
  onUpdate?: (id: string, data: CreatePropertyInput) => void;
  editingProperty?: Property | null;
}

interface PreviewItem {
  preview: string;
  file?: File;
  isUrl?: boolean;
}

// ── All UI state lives in one object → single dispatch, no cascading renders ──
interface ModalState {
  title: string;
  description: string;
  price: string;
  location: string;
  previews: PreviewItem[];
  errors: Record<string, string>;
}

type ModalAction =
  | { type: "RESET"; payload: Partial<ModalState> }
  | { type: "SET_FIELD"; field: keyof Pick<ModalState, "title" | "description" | "price" | "location">; value: string }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "CLEAR_ERROR"; field: string }
  | { type: "ADD_PREVIEWS"; items: PreviewItem[] }
  | { type: "REMOVE_PREVIEW"; index: number };

const EMPTY_STATE: ModalState = {
  title: "",
  description: "",
  price: "",
  location: "",
  previews: [],
  errors: {},
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "RESET":
      return { ...EMPTY_STATE, ...action.payload };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "CLEAR_ERROR":
      return { ...state, errors: { ...state.errors, [action.field]: "" } };
    case "ADD_PREVIEWS":
      return { ...state, previews: [...state.previews, ...action.items] };
    case "REMOVE_PREVIEW":
      return { ...state, previews: state.previews.filter((_, i) => i !== action.index) };
    default:
      return state;
  }
}

const MAX_IMAGES = 4;

export function PropertyModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  editingProperty,
}: PropertyModalProps) {
  const [state, dispatch] = useReducer(modalReducer, EMPTY_STATE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useSelector((state: RootState) => state.user.user);

  const isEditMode = !!editingProperty;
  const canAddMore = state.previews.length < MAX_IMAGES;

  // ── Single dispatch in effect — no cascading renders ───────────────────────
  const buildResetPayload = useCallback(
    (property: Property | null | undefined): Partial<ModalState> => {
      if (!property) return EMPTY_STATE;
      return {
        title: property.title,
        description: property.description,
        price: property.price.toString(),
        location: property.location,
        previews: (property.imageUrl ?? []).map((url) => ({ preview: url, isUrl: true })),
        errors: {},
      };
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    // ONE dispatch → ONE state update → no cascading renders
    dispatch({ type: "RESET", payload: buildResetPayload(editingProperty) });
  }, [open, editingProperty, buildResetPayload]);

  if (!open) return null;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!state.title.trim()) errors.title = "Title is required";
    if (!state.description.trim()) errors.description = "Description is required";
    if (!state.price) errors.price = "Price is required";
    else if (isNaN(Number(state.price))) errors.price = "Price must be a number";
    if (!state.location.trim()) errors.location = "Location is required";
    if (state.previews.length === 0) errors.images = "At least one image is required";
    dispatch({ type: "SET_ERRORS", errors });
    return Object.keys(errors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreatePropertyInput = {
      title: state.title.trim(),
      description: state.description.trim(),
      price: Number(state.price),
      location: state.location.trim(),
      owner: user?._id as string,
      imageFiles: state.previews.filter((p) => p.file).map((p) => p.file as File),
      imageUrl: state.previews.filter((p) => p.isUrl).map((p) => p.preview),
    };

    if (isEditMode && onUpdate && editingProperty?._id) {
      onUpdate(editingProperty._id, payload);
    } else {
      onCreate(payload);
    }

    handleClose();
  };

  // ── Reset & Close ──────────────────────────────────────────────────────────
  const handleClose = () => {
    dispatch({ type: "RESET", payload: EMPTY_STATE });
    onClose();
  };

  // ── File upload handlers ───────────────────────────────────────────────────
  const addFiles = (files: File[]) => {
    const remaining = MAX_IMAGES - state.previews.length;
    if (remaining <= 0) return;

    const toAdd = files.slice(0, remaining);
    const loaded: PreviewItem[] = [];

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        loaded.push({ preview: reader.result as string, file });
        // Batch all loaded files into a single dispatch when done
        if (loaded.length === toAdd.length) {
          dispatch({ type: "ADD_PREVIEWS", items: loaded });
          dispatch({ type: "CLEAR_ERROR", field: "images" });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: "SET_FIELD",
      field: name as keyof Pick<ModalState, "title" | "description" | "price" | "location">,
      value,
    });
    if (state.errors[name]) dispatch({ type: "CLEAR_ERROR", field: name });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Property" : "Add New Property"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isEditMode ? "Update your property details" : "Fill in the details to list your property"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Property Title</label>
            <Input
              name="title"
              value={state.title}
              onChange={handleChange}
              placeholder="e.g., Modern Downtown Apartment"
              className={state.errors.title ? "border-red-400" : ""}
            />
            {state.errors.title && <p className="text-red-500 text-xs mt-1">{state.errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Description</label>
            <Textarea
              name="description"
              value={state.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows={3}
              className={state.errors.description ? "border-red-400" : ""}
            />
            {state.errors.description && <p className="text-red-500 text-xs mt-1">{state.errors.description}</p>}
          </div>

          {/* Price + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">Price ($)</label>
              <Input
                name="price"
                value={state.price}
                onChange={handleChange}
                placeholder="e.g., 2500"
                className={state.errors.price ? "border-red-400" : ""}
              />
              {state.errors.price && <p className="text-red-500 text-xs mt-1">{state.errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">Location</label>
              <Input
                name="location"
                value={state.location}
                onChange={handleChange}
                placeholder="e.g., New York, NY"
                className={state.errors.location ? "border-red-400" : ""}
              />
              {state.errors.location && <p className="text-red-500 text-xs mt-1">{state.errors.location}</p>}
            </div>
          </div>

          {/* Image Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-800">Property Images</label>
              <span className="text-xs text-slate-400">{state.previews.length} / {MAX_IMAGES} images</span>
            </div>

            {canAddMore && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-3
                  border-slate-200 hover:border-blue-300 hover:bg-slate-50
                  ${state.errors.images ? "border-red-300" : ""}`}
              >
                <div className="h-32 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Upload size={20} className="text-slate-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">
                      Drop images here, or <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP — select multiple at once</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {!canAddMore && (
              <p className="text-amber-500 text-xs mb-2">
                Maximum of {MAX_IMAGES} images reached. Remove one to add another.
              </p>
            )}

            {state.previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-1">
                {state.previews.map((item, index) => (
                  <div key={index} className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=150&fit=crop";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REMOVE_PREVIEW", index })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs rounded px-1">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {state.errors.images && <p className="text-red-500 text-xs mt-1">{state.errors.images}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              {isEditMode ? "Save Changes" : "Add Property"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
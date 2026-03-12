// components/property/PropertyCard.tsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Pencil } from "lucide-react";
import type { Property } from "@/types/propertyTypes";

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
  onEdit: (property: Property) => void;
}

export function PropertyCard({ property, onDelete, onEdit }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <img
          src={property.imageUrl[0]}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
          {property.title}
        </h3>

        <p className="text-blue-600 font-bold text-xl mt-1">
          ${property.price.toLocaleString()}
        </p>

        <p className="text-sm text-slate-500 mt-1">{property.location}</p>

        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
          {property.description}
        </p>

        <p className="text-xs text-slate-400 mt-2">
          Listed:{" "}
          {new Date(property.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="flex gap-2 mt-4">
          {/* View */}
          <Link to={`/details-page/${property._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Eye size={16} />
              View
            </Button>
          </Link>

          {/* Edit */}
          <button
            onClick={() => onEdit(property)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Pencil size={16} />
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(property._id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
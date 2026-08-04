"use client";

import { Phone, MessageCircle, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ServiceListing } from "@/lib/types";

interface ServiceCardProps {
  service: ServiceListing;
  onBook: (service: ServiceListing) => void;
}

// Mirrors the "AC REPAIR PROVIDERS" listing in Fig. 8: name, category,
// and one-tap Call / WhatsApp buttons so seniors never have to type or
// remember a phone number.
export function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <Card>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-lg font-bold">{service.name}</p>
          <p className="text-sm text-ink-700">{service.category}</p>
        </div>
        {service.rating_avg > 0 && (
          <div className="flex items-center gap-1 text-golden-600">
            <Star size={18} fill="currentColor" />
            <span className="font-semibold">{service.rating_avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {service.phone && (
          
            href={`tel:${service.phone}`}
            className="min-h-touch flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 font-semibold text-pills"
          >
            <Phone size={18} /> Call
          </a>
        )}
        {service.whatsapp_number && (
          
            href={`https://wa.me/${service.whatsapp_number.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-touch flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 font-semibold text-green-700"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        )}
      </div>

      <button
        onClick={() => onBook(service)}
        className="min-h-touch mt-2 w-full rounded-xl bg-services font-semibold text-white"
      >
        Book this service
      </button>
    </Card>
  );
}

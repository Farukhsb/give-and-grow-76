import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  increment,
  updateDoc,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Charity {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  location: string;
  urgency: string;
  image: string;
  goalAmount: number;
  amountRaised: number;
  donors: number;
  featured: boolean;
}

function mapDoc(doc: QueryDocumentSnapshot): Charity {
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name ?? d.Name ?? "",
    description: d.description ?? d.Description ?? "",
    longDescription: d.longDescription ?? d.LongDescription ?? "",
    category: d.category ?? d.Category ?? "",
    location: d.location ?? d.Location ?? "",
    urgency: d.urgency ?? d.Urgency ?? "medium",
    image: d.image ?? d.Image ?? "",
    goalAmount: Number(d.goalAmount ?? d.GoalAmount ?? 0),
    amountRaised: Number(d.amountRaised ?? d.AmountRaised ?? 0),
    donors: Number(d.donors ?? d.Donors ?? 0),
    featured: Boolean(d.featured ?? d.Featured ?? false),
  };
}

export function useCharities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "charities"), (snapshot) => {
      setCharities(snapshot.docs.map(mapDoc));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { charities, loading };
}

export function useCharity(id: string | undefined) {
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "charities", id), (snap) => {
      if (snap.exists()) {
        setCharity(mapDoc(snap as unknown as QueryDocumentSnapshot));
      } else {
        setCharity(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { charity, loading };
}

export async function addDonation(charityId: string, amount: number) {
  const ref = doc(db, "charities", charityId);
  await updateDoc(ref, {
    amountRaised: increment(amount),
    donors: increment(1),
  });
}

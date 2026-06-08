import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const categories = [
  {
    id: 'food',
    label: 'Land Use & Food',
    sub: 'Agriculture, farming and food sustainability',
    items: [
      { tag: '#FoodWasteWarrior', text: 'Used up leftovers creatively — nothing went to waste!' },
      { tag: '#GrowYourOwn', text: 'Harvested my first home-grown tomatoes — so satisfying!' },
      { tag: '#LocalLarder', text: 'Bought all my groceries from local producers this week.' },
      { tag: '#MeatFreeMonday', text: 'Enjoyed a delicious plant-based meal every Monday this month.' },
    ],
  },
  {
    id: 'energy',
    label: 'Energy & Home',
    sub: 'Heating, electricity and home efficiency',
    items: [
      { tag: '#OneDegreeDown', text: 'Turned the thermostat down by 1°C — barely noticed!' },
      { tag: '#AirFryerAce', text: 'Swapped the oven for the air fryer all week.' },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    sub: 'Walking, cycling and shared travel',
    items: [
      { tag: '#WalkItOut', text: 'Walked the kids to school every day this week.' },
      { tag: '#LiftShare', text: 'Shared a lift with neighbours into town.' },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const AddStoryDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const [catId, setCatId] = useState(categories[0].id);
  const cat = categories.find((c) => c.id === catId)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-0 text-white max-w-md p-5 rounded-3xl">
        <h2 className="font-serif font-bold text-3xl text-center mb-4">Add A Community Story!</h2>

        <div className="bg-white rounded-2xl p-3 max-h-[60vh] overflow-y-auto">
          <select
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="w-full bg-[#1f1f1f] text-[#f5a623] font-serif font-bold rounded-xl p-3 mb-3"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <p className="text-gray-600 font-serif text-sm px-2 -mt-2 mb-3">{cat.sub}</p>

          <div className="space-y-3">
            {cat.items.map((it, i) => (
              <button
                key={i}
                onClick={() => onOpenChange(false)}
                className="w-full bg-[#1f1f1f] rounded-xl p-3 text-center border border-white/20"
              >
                <p className="text-[#f5a623] font-serif font-bold">{it.tag}</p>
                <p className="text-white font-serif mt-1 text-sm">{it.text}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="w-full bg-red-500 text-white font-serif font-bold py-3 rounded-xl mt-4"
        >
          CLOSE
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default AddStoryDialog;

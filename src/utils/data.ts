import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDotDashed,
} from "lucide-react";

export const statuses = [
  {
    label: "Failed",
    value: false,
    icon: CircleAlert,
  },
  {
    label: "Success",
    value: true,
    icon: CircleCheck,
  },
];

export const compressions = [
  {
    label: "Yes",
    value: true,
    icon: CircleDotDashed,
  },
  {
    label: "No",
    value: false,
    icon: Circle,
  },
];

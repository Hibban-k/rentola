import { z } from "zod";

export const rentalCreateSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }).refine((date) => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, {
    message: "Start date cannot be in the past",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after the start date",
  path: ["endDate"],
});

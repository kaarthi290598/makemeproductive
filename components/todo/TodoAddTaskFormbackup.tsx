// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { CustomDatePicker } from "../customDatePicker";

// import { createTodo } from "@/lib/actions/todosData";
// import { Category } from "@/lib/types/type";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
// import SpinnerLoad from "../spinner";

// const formSchema = z.object({
//   name: z.string().min(3, {
//     message: "Task must be at least 3 characters.",
//   }),
//   category_Id: z.string().min(1, {
//     message: "Category ID is required.",
//   }),
//   deadline: z
//     .string()
//     .optional()
//     .refine((val) => !val || !isNaN(Date.parse(val)), {
//       message: "Invalid date format.",
//     }),
// });

// export function TodoAddTaskForm({
//   setOpen,
//   categories,
// }: {
//   setOpen: (open: boolean) => void;
//   categories: any;
// }) {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       category_Id: "",
//       deadline: "", // Deadline is optional
//     },
//   });

//   const { mutate: addTaskMutate, isPending } = useMutation({
//     mutationFn: createTodo,

//     onSuccess: () => {
//       setOpen(false);

//       toast.success("Task added successfully!");
//     },
//     onError: (err: Error) => {
//       toast.error(`Error adding Task: ${err.message}`);
//     },
//   });

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     const todoValues = {
//       isCompleted: false,
//       deadline: values.deadline ? new Date(values.deadline) : null,
//       category_Id: Number(values.category_Id),
//       name: values.name,
//     };

//     await addTaskMutate(todoValues);
//     setOpen(false);
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//         {/* Task Field */}
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Task*</FormLabel>
//               <FormControl>
//                 <Input placeholder="Task Name" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Category Field */}
//         <FormField
//           control={form.control}
//           name="category_Id"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Category*</FormLabel>
//               <FormControl>
//                 <Select onValueChange={field.onChange} value={field.value}>
//                   <SelectTrigger className="border">
//                     <SelectValue placeholder="Select Category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectLabel>Categories</SelectLabel>

//                       {categories.map((category: Category) => (
//                         <SelectItem
//                           key={category.id}
//                           value={String(category.id)}
//                         >
//                           {category.category}
//                         </SelectItem>
//                       ))}
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Deadline Field */}
//         <FormField
//           control={form.control}
//           name="deadline"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Deadline</FormLabel>
//               <FormControl>
//                 <CustomDatePicker
//                   // Convert stored string to Date; if empty, use undefined.
//                   value={field.value ? new Date(field.value) : undefined}
//                   onChange={(date) => {
//                     // Convert the Date to an ISO string (or empty string if undefined)
//                     field.onChange(date ? date.toISOString() : "");
//                   }}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <div className="flex justify-end gap-4">
//           <Button variant="destructive" onClick={() => setOpen(false)}>
//             Cancel
//           </Button>
//           <Button type="submit" className="">
//             {isPending ? <SpinnerLoad /> : "Add Task"}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

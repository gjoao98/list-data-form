import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Check, Loader2, X } from 'lucide-react'

const createTagSchema = z.object({
    title: z.string().min(3, { message: "Minimum 3 caracters." }),
})

type CreateTagSchema = z.infer<typeof createTagSchema>

function getSlugFromString(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
}

export function CreateTagForm() {
    const queryClient = useQueryClient()

    const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
        resolver: zodResolver(createTagSchema)
    })

    const slug = watch('title')
        ? getSlugFromString(watch('title'))
        : ''

    const { mutateAsync } = useMutation({
        mutationFn: async ({ title }: CreateTagSchema) => {
            //delay 2s
            await new Promise(resolve => setTimeout(resolve, 2000))

            await fetch('http://localhost:3333/tags', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    slug,
                    amountOfVideos: 0,
                })
            })

            toast.success("Tag criada com sucesso!", { duration: 2000, })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-tags']
            })
        }
    })

    async function createTag({ title }: CreateTagSchema) {
        await mutateAsync({ title })
    }

    return (
        <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium block" htmlFor="title">Tag Name</label>
                <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className="border border-zinc-800 outline-none rounded-lg px-3 py-2.5 text-sm bg-zinc-800/50 w-full"
                />
                {formState.errors?.title && (
                    <p className="text-sm text-red-400" >{formState.errors.title.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium block" htmlFor="slug">Slug</label>
                <input
                    id="slug"
                    type="text"
                    readOnly
                    value={slug}
                    className="border border-zinc-800/20 outline-none rounded-lg h-10 px-3 py-2.5 text-sm bg-zinc-800/20 w-full"
                />
            </div>
            <div className="flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                    <Button>
                        <X size={12} />
                        Cancel
                    </Button>
                </Dialog.Close>
                <Button disabled={formState.isSubmitting} className="bg-teal-400 text-teal-950" type="submit">
                    {formState.isSubmitting
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Check size={12} />
                    }
                    Save
                </Button>
            </div>
        </form>
    )
}
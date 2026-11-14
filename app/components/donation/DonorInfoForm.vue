<script setup lang="ts">
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Checkbox } from "@/components/ui/checkbox";
  import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
  import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from "~~/shared/donation";

  const donorName   = defineModel<string>("donorName", { required: true });
  const message     = defineModel<string>("message", { required: true });
  const isAnonymous = defineModel<boolean>("isAnonymous", { required: true });

  useAnonymousName(donorName, isAnonymous);
</script>

<template>
  <FieldGroup class="gap-2.5 pt-3 border-t">
    <Field>
      <FieldLabel for="donor-name" class="text-[13px]">
        Your name
      </FieldLabel>
      <Input
        id="donor-name"
        v-model="donorName"
        :disabled="isAnonymous"
        placeholder="Your name (optional)"
        type="text"
        :maxlength="MAX_NAME_LENGTH"
        class="text-sm"
      />
    </Field>

    <Field>
      <FieldLabel for="donor-message" class="text-[13px]">
        Message
      </FieldLabel>
      <div class="relative w-full">
        <Textarea
          id="donor-message"
          v-model="message"
          placeholder="Write a message of support (optional)..."
          :maxlength="MAX_MESSAGE_LENGTH"
          class="text-sm min-h-20 pb-6 resize-y"
        />
        <span class="absolute bottom-2 right-2.5 text-[10px] text-muted-foreground pointer-events-none select-none bg-background/80 px-1 rounded">
          {{ message.length }}/{{ MAX_MESSAGE_LENGTH }}
        </span>
      </div>
    </Field>

    <Field orientation="horizontal" class="mt-0.5">
      <Checkbox id="anonymous" v-model="isAnonymous" />
      <FieldLabel for="anonymous" class="text-[13px] text-muted-foreground">
        Send anonymously
      </FieldLabel>
    </Field>
  </FieldGroup>
</template>

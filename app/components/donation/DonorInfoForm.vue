<script setup lang="ts">
  import { watch } from "vue";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Checkbox } from "@/components/ui/checkbox";

  const donorName   = defineModel<string>("donorName", { required: true });
  const message     = defineModel<string>("message", { required: true });
  const isAnonymous = defineModel<boolean>("isAnonymous", { required: true });

  watch(isAnonymous, (newVal) => {
    donorName.value = newVal ? "Anonymous" : "";
  });
</script>

<template>
  <div class="flex flex-col gap-2.5 pt-3 border-t border-border">
    <Input
      v-model="donorName"
      :disabled="isAnonymous"
      placeholder="Your name (optional)"
      type="text"
      maxlength="50"
      class="font-inter text-sm h-9 bg-background border-border disabled:opacity-50 disabled:cursor-not-allowed"
    />

    <div class="relative w-full">
      <Textarea
        v-model="message"
        placeholder="Write a message of support (optional)..."
        maxlength="200"
        class="font-inter text-sm min-h-20 pb-6 resize-y bg-background border-border"
      />
      <span class="absolute bottom-2 right-2.5 font-inter text-[10px] text-muted-foreground pointer-events-none select-none bg-background/80 px-1 rounded">
        {{ message.length }}/200
      </span>
    </div>

    <label class="inline-flex w-fit font-inter items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors mt-0.5">
      <Checkbox id="anonymous" v-model="isAnonymous" class="h-4 w-4" />
      <span>Send anonymously</span>
    </label>
  </div>
</template>
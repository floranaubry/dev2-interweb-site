<script setup lang="ts">
/**
 * PageRenderer — Renders a page from PageDef
 *
 * V4 — With Shell System:
 * - Uses ShellRenderer for header/footer
 * - Validates shell definitions at render time
 * - Does NOT calculate packsUsed (done at route level)
 */
import type { PageDef } from '~/schema/page.schema'
import SectionRenderer from './SectionRenderer.vue'
import ShellRenderer from './ShellRenderer.vue'

interface Props {
  page: PageDef
}

const props = defineProps<Props>()
</script>

<template>
  <div class="page-renderer">
    <!-- Header (via ShellRenderer) -->
    <ShellRenderer slot="header" :shell-def="page.shell?.header" />

    <!-- Sections -->
    <main>
      <!--
        NOTE: page.themeOverrides is NOT passed here.
        Page-level overrides are applied by ThemeScope in the route.
        Section-level overrides are applied by SectionRenderer.
        No double-application of CSS vars.
      -->
      <SectionRenderer
        v-for="(section, index) in page.sections"
        :key="`section-${index}-${section.id}`"
        :section="section"
        :page-pack="page.packKey"
      />
    </main>

    <!-- Footer (via ShellRenderer) -->
    <ShellRenderer slot="footer" :shell-def="page.shell?.footer" />
  </div>
</template>

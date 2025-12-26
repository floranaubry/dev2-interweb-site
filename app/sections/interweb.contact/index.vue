<script setup lang="ts">
import { ref } from 'vue'
import type { InterwebContactProps } from './schema'

const props = defineProps<InterwebContactProps>()

// Form state (UI-only, no submission)
const formData = ref({
  name: '',
  email: '',
  message: ''
})

const handleSubmit = () => {
  // Build mailto link with form data
  const subject = encodeURIComponent('Demande de contact - Interweb')
  const body = encodeURIComponent(
    `Nom: ${formData.value.name}\nEmail: ${formData.value.email}\n\nMessage:\n${formData.value.message}`
  )
  window.location.href = `${props.formAction}?subject=${subject}&body=${body}`
}
</script>

<template>
  <section :id="anchorId || 'contact'" class="section">
    <div class="container">
      <div class="contact-section">
        <div class="contact-section__gradient"></div>
        <div class="contact-section__content">
          <!-- Form Card -->
          <div class="contact-form-card">
            <div class="contact-form-card__header">
              <div>
                <p class="contact-form-card__subtitle">{{ props.formSubtitle }}</p>
                <h3 class="contact-form-card__title">{{ props.formTitle }}</h3>
              </div>
              <div class="contact-form-card__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
                  />
                </svg>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" class="form">
              <template v-for="field in props.formFields" :key="field.name">
                <div class="form-group">
                  <label :for="`ct-${field.name}`" class="form-label">
                    {{ field.label }}
                    <span v-if="field.required">*</span>
                  </label>

                  <template v-if="field.type === 'email'">
                    <div class="form-input-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                      </svg>
                      <input
                        :id="`ct-${field.name}`"
                        v-model="formData[field.name]"
                        :name="field.name"
                        type="email"
                        :required="field.required"
                        :placeholder="field.placeholder"
                        class="form-input form-input--with-icon"
                      />
                    </div>
                  </template>

                  <template v-else-if="field.type === 'textarea'">
                    <textarea
                      :id="`ct-${field.name}`"
                      v-model="formData[field.name]"
                      :name="field.name"
                      rows="4"
                      :placeholder="field.placeholder"
                      class="form-textarea"
                    ></textarea>
                  </template>

                  <template v-else>
                    <input
                      :id="`ct-${field.name}`"
                      v-model="formData[field.name]"
                      :name="field.name"
                      type="text"
                      :required="field.required"
                      :placeholder="field.placeholder"
                      class="form-input"
                    />
                  </template>
                </div>
              </template>

              <button type="submit" class="form-submit">
                {{ props.formSubmitLabel }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
              <p class="form-disclaimer">{{ props.formDisclaimer }}</p>
            </form>
          </div>

          <!-- Info Side -->
          <div class="contact-info">
            <h2 class="contact-info__title">{{ props.infoTitle }}</h2>
            <p class="contact-info__description">
              {{ props.infoDescription }}
            </p>

            <div class="contact-highlights">
              <div
                v-for="(highlight, index) in props.highlights"
                :key="index"
                class="contact-highlight"
              >
                <div class="contact-highlight__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path :d="highlight.iconPath" />
                  </svg>
                </div>
                <div>
                  <p class="contact-highlight__title">{{ highlight.title }}</p>
                  <p class="contact-highlight__text">{{ highlight.text }}</p>
                </div>
              </div>
            </div>

            <!-- Direct Contact -->
            <div v-if="props.directContact" class="contact-direct">
              <img
                v-if="props.directContact.avatarUrl"
                :src="props.directContact.avatarUrl"
                :alt="props.directContact.name"
                class="contact-direct__avatar"
              />
              <div
                v-else
                class="contact-direct__avatar avatar-placeholder"
                :style="{ background: props.directContact.avatarGradient }"
              ></div>
              <div class="contact-direct__info">
                <p class="contact-direct__role">{{ props.directContact.role }}</p>
                <p class="contact-direct__name">{{ props.directContact.name }}</p>
              </div>
              <a :href="`mailto:${props.directContact.email}`" class="contact-direct__link">
                {{ props.directContact.linkLabel }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

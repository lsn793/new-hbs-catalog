import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BeetleCatalogService } from './beetle-catalog.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap detail-page">
      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Loading beetle details"><div class="skeleton"></div></div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert">
          <div><div class="eyebrow">Record unavailable</div><h2>The beetle details could not be opened</h2>
            <p>{{ catalog.errorMessage() }} Check the JSON URL in <code>src/app/data-config.ts</code>, then try again.</p>
            <button type="button" (click)="catalog.load()">Try loading again</button></div>
        </section>
      } @else {
        @if (record(); as beetle) {
          <header class="detail-header">
            <a class="detail-back" routerLink="/beetles"><span aria-hidden="true">←</span> Back to collection</a>
            <div class="eyebrow">Record {{ beetle.id }} · Specimen details</div>
            <h1>{{ catalog.displayName(beetle) }}</h1>
            @if (beetle.scientificName && beetle.scientificName !== catalog.displayName(beetle)) {
              <p class="detail-scientific">{{ beetle.scientificName }}</p>
            }
          </header>

          <div class="detail-layout">
            <section class="detail-gallery" [attr.aria-label]="images().length + ' images for ' + catalog.displayName(beetle)">
              @for (image of images(); track $index; let i = $index) {
                <figure class="detail-image">
                  <div class="detail-image-frame">
                    <img [src]="image" [alt]="catalog.imageAlt(beetle, i)" [attr.loading]="i === 0 ? 'eager' : 'lazy'" width="1024" height="1024" decoding="async">
                    @if (catalog.hasPlaceholderImage(beetle, i)) { <span class="image-note">Illustrative placeholder</span> }
                  </div>
                  <figcaption>Image {{ i + 1 }} of {{ images().length }}</figcaption>
                </figure>
              }
            </section>

            <aside class="detail-info">
              <div class="eyebrow">Field notes</div>
              <section class="detail-description">
                <h2>Description</h2>
                @if (beetle.description) {
                  <p>{{ beetle.description }}</p>
                } @else {
                  <p class="detail-unrecorded">No description recorded.</p>
                }
              </section>
              <h2 class="detail-section-title">Classification and attributes</h2>
              <dl class="field-list">
                @if (beetle.genus !== undefined) { <div class="field-row"><dt>Genus</dt><dd>{{ catalog.taxonomyValue(beetle.genus) }}</dd></div> }
                @if (beetle.family !== undefined) { <div class="field-row"><dt>Family</dt><dd>{{ catalog.taxonomyValue(beetle.family) }}</dd></div> }
                @for (attribute of catalog.extraAttributes(beetle); track attribute.label) {
                  <div class="field-row"><dt>{{ attribute.label }}</dt><dd>{{ attribute.value }}</dd></div>
                }
              </dl>
            </aside>
          </div>
        } @else {
          <section class="state-panel">
            <div><div class="eyebrow">No matching record</div><h2>This beetle is not in the catalog</h2>
              <p>The link may be out of date, or this record may have been removed.</p>
              <a class="button-link" routerLink="/beetles">Return to collection <span aria-hidden="true">↗</span></a></div>
          </section>
        }
      }
    </section>
  `,
})
export class BeetleDetailsPageComponent {
  readonly catalog = inject(BeetleCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly recordId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );
  readonly record = computed(() => this.catalog.records().find((beetle) => beetle.id === this.recordId()));
  readonly images = computed(() => {
    const record = this.record();
    return record ? this.catalog.imageUrls(record) : [];
  });
}

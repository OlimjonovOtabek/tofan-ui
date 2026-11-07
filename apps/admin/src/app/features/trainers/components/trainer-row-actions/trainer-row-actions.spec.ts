import { TestBed } from '@angular/core/testing';
import { Trainer } from '../../models/trainer';
import { toTrainer } from '../../services/trainer.mapper';
import { TrainerRowActions } from './trainer-row-actions';

const ICON_PREFIX = 'pi-';

function trainerWith(isPublished: boolean): Trainer {
  return toTrainer(
    {
      id: 't1',
      userId: 'u1',
      displayName: 'Jasur Karimov',
      bio: null,
      photoFileId: null,
      monthlyPrice: 450000,
      isPublished,
      createdOnUtc: '2026-10-02T09:00:00Z',
    },
    (fileId) => fileId,
  );
}

function render(trainer: Trainer): { actions: TrainerRowActions; element: HTMLElement } {
  const fixture = TestBed.createComponent(TrainerRowActions);
  fixture.componentRef.setInput('trainer', trainer);
  fixture.detectChanges();
  return {
    actions: fixture.componentInstance,
    element: fixture.nativeElement as HTMLElement,
  };
}

function iconsOf(element: HTMLElement): string[] {
  return [...element.querySelectorAll('button .p-button-icon')].flatMap((icon) =>
    [...icon.classList].filter((name) => name.startsWith(ICON_PREFIX)),
  );
}

describe('TrainerRowActions', () => {
  it('should offer edit, password, grant, publish and delete when the trainer is a draft', () => {
    const { element } = render(trainerWith(false));

    expect(iconsOf(element)).toEqual(['pi-pencil', 'pi-key', 'pi-user-plus', 'pi-eye', 'pi-trash']);
  });

  it('should offer edit, password, grant and unpublish when the trainer is published', () => {
    const { element } = render(trainerWith(true));

    expect(iconsOf(element)).toEqual(['pi-pencil', 'pi-key', 'pi-user-plus', 'pi-eye-slash']);
  });

  it('should ask to grant a subscription when the grant button is pressed', () => {
    const { actions, element } = render(trainerWith(true));
    const granted = vi.fn();
    actions.grant.subscribe(granted);

    element.querySelector('button .pi-user-plus')?.closest('button')?.click();

    expect(granted).toHaveBeenCalledTimes(1);
  });
});

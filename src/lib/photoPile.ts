import gsap from 'gsap';

import { tossPhoto } from './tossPhoto';

/** One photo in the pile: the holder keeps its place and its turn in the
 * stack (z-index and the --f* offsets in PhotoPile.module.css), the photo
 * inside is what tossPhoto throws. */
export type PileCard = { holder: HTMLElement; photo: HTMLElement };

export type PhotoPileControl = {
  /** Hides every print but the first and tosses them on one by one. */
  deal(): void;
  /** Flips one photo: 1 tucks the top one under the pile, -1 pulls the
   * bottom one out and lays it on top. Stops the dealing first. Returns how
   * long the flip runs, in ms. */
  step(direction: 1 | -1): number;
  /** Kills everything running and leaves each photo where it lies. */
  destroy(): void;
};

/* Seconds from one print's toss to the next: the 1.3s toss plus a beat to
   see it lie there before the next one comes. */
const DEAL_STRIDE = 1.5;

/* A flip slides the photo out past the pile's edge, lifted, while it changes
   places, then back in: out by this share of its own width, turned this
   many degrees further. */
const OUT = { x: 0.62, y: -0.05, rotation: 7, lift: 0.7 };
const OUT_S = 0.3;
const BACK_S = 0.4;

const FLIP_PROPS = '--fx,--fy,--fr,--flift,zIndex';

/**
 * The homepage pile as a deck. It deals itself as an autoplay, a print every
 * stride, and flips on demand; the first flip ends the autoplay and slips
 * any prints still undealt in under the top one, so every photo is in the deck.
 *
 * Cards come bottom first, in DOM order. Without motion there is no deal:
 * only the headshot shows (PhotoPile.module.css hides the prints), and each
 * step lays the next print on top as it is, then cycles the stacking order.
 */
export function photoPile(cards: PileCard[], { motion }: { motion: boolean }): PhotoPileControl {
  /* Bottom to top. */
  let deck = motion ? [...cards] : cards.slice(0, 1);
  let hand: PileCard[] = motion ? [] : cards.slice(1);
  let timer: gsap.core.Tween | null = null;
  let waiting: (() => void) | null = null;
  const tosses: (() => void)[] = [];
  let flip: gsap.core.Timeline | null = null;

  const restack = () => deck.forEach((card, i) => gsap.set(card.holder, { zIndex: i + 1 }));

  /* A print whose image hasn't loaded by its turn holds the deal until it
     has, so none lands blank. */
  const whenLoaded = (photo: HTMLElement, go: () => void) => {
    const img = photo.querySelector('img');
    if (!img || img.complete) return go();
    const done = () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
      waiting = null;
      go();
    };
    img.addEventListener('load', done);
    img.addEventListener('error', done);
    waiting = () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
    };
  };

  const dealNext = () => {
    const card = hand[0];
    if (!card) return;
    whenLoaded(card.photo, () => {
      hand.shift();
      deck.push(card);
      restack();
      tosses.push(tossPhoto(card.photo));
      timer = gsap.delayedCall(DEAL_STRIDE, dealNext);
    });
  };

  /* Prints still in hand slip in just under the top photo, fading in at its
     edges, next-to-deal nearest the top: tucking photos under then reveals
     them in the order they would have been dealt, before any seen ones come
     round again. Any toss already in the air finishes its landing. */
  const stopDealing = () => {
    timer?.kill();
    waiting?.();
    waiting = null;
    if (!hand.length) return;
    const undealt = hand.map((card) => card.photo);
    deck = [...deck.slice(0, -1), ...hand.reverse(), ...deck.slice(-1)];
    hand = [];
    restack();
    gsap.to(undealt, {
      autoAlpha: 1,
      duration: motion ? 0.4 : 0,
      ease: 'none',
      onComplete: () => gsap.set(undealt, { clearProps: 'opacity,visibility' }),
    });
  };

  return {
    deal() {
      hand = cards.slice(1);
      deck = cards.slice(0, 1);
      gsap.set(
        hand.map((card) => card.photo),
        { autoAlpha: 0 },
      );
      /* The first goes as the headshot's own toss is landing. */
      timer = gsap.delayedCall(DEAL_STRIDE, dealNext);
    },

    step(direction) {
      if (!motion && hand.length) {
        const card = hand.shift()!;
        deck.push(card);
        restack();
        gsap.set(card.photo, { visibility: 'visible' });
        return 0;
      }
      stopDealing();
      if (deck.length < 2) return 0;
      flip?.progress(1);

      const card = direction === 1 ? deck.pop()! : deck.shift()!;
      if (direction === 1) deck.unshift(card);
      else deck.push(card);

      if (!motion) {
        restack();
        return 0;
      }

      /* Tucked under slides out to the right, pulled from under to the left,
         so the two directions read as opposites. */
      const side = direction;
      const { offsetWidth: width, offsetHeight: height } = card.photo;
      flip = gsap
        .timeline()
        .fromTo(
          card.holder,
          { '--fx': '0px', '--fy': '0px', '--fr': '0deg', '--flift': 0 },
          {
            '--fx': `${side * width * OUT.x}px`,
            '--fy': `${height * OUT.y}px`,
            '--fr': `${side * OUT.rotation}deg`,
            '--flift': OUT.lift,
            duration: OUT_S,
            ease: 'power2.out',
          },
        )
        /* Clear of the pile: it changes places here, unseen. */
        .add(restack)
        .to(card.holder, {
          '--fx': '0px',
          '--fy': '0px',
          '--fr': '0deg',
          '--flift': 0,
          duration: BACK_S,
          ease: 'power2.inOut',
        });
      return (OUT_S + BACK_S) * 1000;
    },

    destroy() {
      timer?.kill();
      waiting?.();
      flip?.kill();
      tosses.forEach((cancel) => cancel());
      gsap.set(
        cards.map((card) => card.holder),
        { clearProps: FLIP_PROPS },
      );
      gsap.set(
        hand.map((card) => card.photo),
        { clearProps: 'opacity,visibility' },
      );
    },
  };
}

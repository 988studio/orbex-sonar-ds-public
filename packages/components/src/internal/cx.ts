/** Joins class names, skipping empty ones: cx('sonar-button', className) */
export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ')

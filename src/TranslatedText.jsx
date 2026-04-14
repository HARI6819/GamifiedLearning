function TranslatedText({ children, ...props }) {
    // Pass data-original as a React prop so it survives re-renders & React reconciliation.
    // The MutationObserver in useTranslate reads this to always know the source English text.
    return (
        <span
            data-translate
            data-original={typeof children === 'string' ? children : undefined}
            {...props}
        >
            {children}
        </span>
    );
}

export default TranslatedText;

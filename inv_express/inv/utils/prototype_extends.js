
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

String.prototype.replaceAll = function (FindText, RepText) {
    let regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
};
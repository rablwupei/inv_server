
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
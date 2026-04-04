/* ========================================================================
 * Custom dropdown handler for TSML (Bootstrap 5 compatible)
 * Uses data-toggle="tsml-dropdown" to avoid conflicts with Bootstrap JS.
 * Adds/removes .show on .dropdown-menu (Bootstrap 5 convention).
 * ======================================================================== */

+function ($) {
  'use strict';

  var toggle = '[data-toggle="tsml-dropdown"]';

  function getMenu($trigger) {
    return $trigger.closest('.dropdown, .input-group').find('.dropdown-menu').first();
  }

  function clearMenus(e) {
    if (e && e.which === 3) return;
    $(toggle).each(function () {
      var $menu = getMenu($(this));
      if (!$menu.hasClass('show')) return;
      if (e && e.type === 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($menu[0], e.target)) return;
      $(this).attr('aria-expanded', 'false');
      $menu.removeClass('show');
    });
  }

  function toggle_dropdown(e) {
    var $this = $(this);
    if ($this.is('.disabled, :disabled')) return;

    var $menu = getMenu($this);
    var isOpen = $menu.hasClass('show');

    clearMenus();

    if (!isOpen) {
      $this.attr('aria-expanded', 'true');
      $menu.addClass('show');
    }

    return false;
  }

  function keydown(e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

    var $this = $(this);
    e.preventDefault();
    e.stopPropagation();

    if ($this.is('.disabled, :disabled')) return;

    var $menu = getMenu($this);
    var isOpen = $menu.hasClass('show');

    if (!isOpen && e.which !== 27 || isOpen && e.which === 27) {
      if (e.which === 27) $this.trigger('focus');
      return $this.trigger('click');
    }

    var $items = $menu.find('li:not(.disabled):visible a');
    if (!$items.length) return;

    var index = $items.index(e.target);
    if (e.which === 38 && index > 0) index--;
    if (e.which === 40 && index < $items.length - 1) index++;
    if (!~index) index = 0;
    $items.eq(index).trigger('focus');
  }

  $(document)
    .on('click.tsml.dropdown', clearMenus)
    .on('click.tsml.dropdown', '.dropdown form', function (e) { e.stopPropagation(); })
    .on('click.tsml.dropdown', toggle, toggle_dropdown)
    .on('keydown.tsml.dropdown', toggle, keydown)
    .on('keydown.tsml.dropdown', '.dropdown-menu', keydown);

}(jQuery);

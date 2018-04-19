# -*- coding: utf-8 -*-
import urllib, StringIO

from openpyxl.reader.excel import load_workbook


class XLSXReader(object):

    def __init__(self, path):

        f = StringIO.StringIO()
        f.write(urllib.urlopen(path).read())
        self.wb = load_workbook(f)


    def import_data(self, kind=None):

        # if not self.sheet:
        #     return None
        #
        # index = 2 if kind == 'product' else 3
        # #index = 3 if kind == 'project' else 2
        #
        # items = list()
        # item = dict()
        # categories = None
        # errors = list()
        #
        # if kind in ('project', 'marketing'):
        #     #print "HERE"
        #     sidebar_category = self.sheet.cell('A1').value
        #     try:
        #         if kind == 'marketing':
        #             sidebar_category = TranslationSidebarCategory.objects.get(name=sidebar_category, is_project=False)
        #         else:
        #             sidebar_category = TranslationSidebarCategory.objects.get(name=sidebar_category, is_project=True)
        #         #print sidebar_category
        #     except:
        #         sidebar_category = None
        #         errors.append('I cannot find %s sidebar category! Skipping.' \
        #             % (self.sheet.cell('A1').value))
        #
        # def add_item():
        #     for category in categories:
        #         new_item = item.copy()
        #         new_item['category'] = category
        #         # Check if translation already exists for this category
        #         if len(Translation.objects.filter(category=category, tag=new_item['tag'], language=Language.objects.get(pk=1), \
        #             original_country=self.original_country)) > 0 \
        #             and not category.is_marketing() and not category.is_project():
        #             new_item['overwrite'] = True
        #         new_item['marketing'] = category.is_marketing() or category.is_project()
        #         if kind == 'project':
        #             if category.is_project() and sidebar_category:
        #                 new_item['sidebar_category'] = sidebar_category
        #                 if len(Translation.objects.filter(category=category, tag=new_item['tag'], language=Language.objects.get(pk=1), \
        #                     original_country=self.original_country, sidebar_category=sidebar_category)) > 0 \
        #                     and not category.is_marketing() and not category.is_marketing():
        #                     new_item['overwrite'] = True
        #                 items.append(new_item)
        #         elif kind == 'marketing':
        #             if category.is_marketing() and sidebar_category:
        #                 new_item['sidebar_category'] = sidebar_category
        #                 items.append(new_item)
        #         else:
        #             items.append(new_item)
        #
        # if not self.sheet:
        #     return None
        #
        # limit = 500
        #
        # while index < limit:
        #     if index == limit - 1:
        #         errors.append('Missing END at last row? System stop!')
        #     if self.sheet.cell('A%s' % index).value and str(self.sheet.cell('A%s' % index).value).upper() == 'END':
        #         if item:
        #             add_item()
        #             item = dict()
        #         break
        #     elif self.sheet.cell('B%s' % index).value == 'ALL':
        #         if item:
        #             add_item()
        #             item = dict()
        #
        #         main_categories = []
        #         if kind == 'marketing':
        #             main_categories = TranslationCategory.objects.marketings()
        #         elif kind == 'product':
        #             main_categories = TranslationCategory.objects.products()
        #         elif kind == 'project':
        #             main_categories = TranslationCategory.objects.projects()
        #         else:
        #             pass
        #
        #         multi_langauge = False
        #
        #         for main_category in main_categories:
        #             if item:
        #                 add_item()
        #                 item = dict()
        #             if self.sheet.cell('D%s' % index).value != 'ALL':
        #                 subs = self.sheet.cell('D%s' % index).value.split(';') if self.sheet.cell('D%s' % index).value else []
        #                 subcategories = [sub.strip() for sub in subs]
        #                 categories = TranslationCategory.objects.filter(parent=main_category, name__in=subcategories)
        #                 if not categories:
        #                     errors.append('Wrong entry at line %s! I couldn\'t find Product <b>%s</b> and form factor <b>%s</b>. Skipping.' \
        #                         % (index, main_category, self.sheet.cell('D%s' % index).value))
        #             else:
        #                 categories = TranslationCategory.objects.filter(parent=main_category)
        #                 if not categories:
        #                     errors.append('Wrong entry at line %s! In %s product (ALL) I couldn\'t find any subcategory.\n Skipping.' \
        #                         % (index, main_category))
        #
        #             tag = TranslationTag.objects.filter(name=self.sheet.cell('C%s' % index).value.lstrip())
        #
        #             item = dict()
        #
        #             item['tag'] = tag[0] if tag else None
        #             item['countries'] = self.country
        #             item['translated_text'] = self.sheet.cell('E%s' % index).value
        #             item['translation-' + self.sheet.cell('F%s' % index).value.lower().strip().replace(' ', '-')] = self.sheet.cell('G%s' % index).value
        #
        #             index += 1
        #
        #             # Check if we have another language
        #             if not self.sheet.cell('B%s' % index).value and self.sheet.cell('A%s' % index).value != 'END':
        #                 item['translation-' + self.sheet.cell('F%s' % index).value.lower().replace(' ', '-')] = self.sheet.cell('G%s' % index).value
        #                 multi_langauge = True
        #
        #             index -= 1
        #
        #         if multi_langauge:
        #             index += 1
        #
        #     elif self.sheet.cell('B%s' % index).value:
        #         if item:
        #             add_item()
        #             item = dict()
        #         if self.sheet.cell('D%s' % index).value != 'ALL':
        #             subs = self.sheet.cell('D%s' % index).value.split(';') if self.sheet.cell('D%s' % index).value else []
        #             subcategories = [sub.strip() for sub in subs]
        #             categories = TranslationCategory.objects.filter(parent__name=self.sheet.cell('B%s' % index).value, name__in=subcategories)
        #         else:
        #             categories = TranslationCategory.objects.filter(parent__name=self.sheet.cell('B%s' % index).value)
        #
        #         if not categories:
        #             if kind in ('project', 'marketing'):
        #                 info = 'Skipping <b>%s - %s</b>. Category was not selected.' % (self.sheet.cell('B%s' % index).value, subs)
        #                 if info not in errors:
        #                     errors.append('Skipping <b>%s - %s</b>.' % (self.sheet.cell('B%s' % index).value, ", ".join(subs)))
        #             else:
        #                 errors.append('Wrong entry at line %s! Product <b>%s</b> and form factor <b>%s</b>. Skipping.' \
        #                             % (index, self.sheet.cell('B%s' % index).value, self.sheet.cell('D%s' % index).value))
        #         excel_tag = self.sheet.cell('C%s' % index).value
        #         tag = TranslationTag.objects.filter(name=excel_tag.lstrip() if excel_tag else excel_tag)
        #
        #         item = dict()
        #
        #         item['tag'] = tag[0] if tag else None
        #         item['countries'] = self.country
        #         item['translated_text'] = self.sheet.cell('E%s' % index).value
        #         item['translation-' + self.sheet.cell('F%s' % index).value.lower().strip().replace(' ', '-')] = self.sheet.cell('G%s' % index).value
        #
        #     else:
        #         try:
        #             item['translation-' + self.sheet.cell('F%s' % index).value.lower().strip().replace(' ', '-')] = self.sheet.cell('G%s' % index).value
        #         except AttributeError:
        #             errors.append('Wrong entry at line %s! Line is empty???' % index)
        #
        #     index += 1
        #
        # #for item in items:
        # #    print item
        return {'items': items, 'error': errors}
